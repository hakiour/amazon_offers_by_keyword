import Apify from 'apify';
import cheerio from 'cheerio';
import { SEARCHED_URL, PRODUCT_URL, OFFERS_URL, HEADERS } from "./constants.js";

await Apify.utils.purgeLocalStorage();

const requestQueue = await Apify.openRequestQueue();

const keyword = await Apify.getInput() || "phone";

await requestQueue.addRequest({
    url: `${SEARCHED_URL}${keyword}`,
    userData: {
        label: 'START',
        code: ""
    },
    headers: HEADERS
});

const products = {}; 
const offers = {};

const crawler = new Apify.CheerioCrawler({
    requestQueue,
    handlePageFunction: async ({ request, response, body}) => {
        console.log( `Navigated to ${request.url}`);

        const $ = cheerio.load(body);

        switch(request.userData.label){
            case "START":
                addProductsToQueue($, requestQueue);
                break;
            case "PRODUCT":
                var ASIN_CODE = request.userData.code;
                //We store the product generic information
                products[ASIN_CODE] = {
                    title: $('#title').text().trim(),
                    url: response.url,
                    description: $('#whatsInTheBoxDeck').text().trim().replace(/\s\s+/g, ": "),
                    keyword: keyword
                }

                //Initialice the array where we will save the different offers by AMAZON asin code
                //Save also the actual offer
                offers[ASIN_CODE] = [
                    {
                        ...products[ASIN_CODE],
                        price: $($('#centerCol span[class*="a-text-price"]span[data-a-color="price"] span[aria-hidden="true"]')[0]).text(),
                        seller: $('a[id*="seller"]').text().trim() || $($('div[tabular-attribute-name="Sold by"] span')[1]).text(),
                        shippingPrice: $($('#centerCol span:contains("hipping").a-size-base.a-color-secondary')[0]).text().match(/[\$\£\€](\d+(?:\.\d{1,2})?)/)[0] || null
                    }
                ];
                
                requestQueue.addRequest(
                    {
                        url: `${OFFERS_URL}${ASIN_CODE}`,
                        userData: {
                            label: 'OFFERS',
                            code: ASIN_CODE
                        },
                        headers: HEADERS
                    }
                );

                break;
            case "OFFERS":
                var ASIN_CODE = request.userData.code;
                var offersList = $("#aod-offer");

                /*if (offersList.length > 0){ //TYPE 1

                    var offer = products[ASIN_CODE];

                    offer.price = $(pinnedOfer)(".a-price").text();
                    offers[ASIN_CODE].push(actualProduct);
                }else{
                    console.log("No offers detected.");
                }
                */
                break;
            default:
                console.log("Not handled for now.");
        }
        console.log(products);
    },
    handleFailedRequestFunction: async ({ request }) => {
		console.log(`Request ${request.url} failed.`);
	},
});


function addProductsToQueue($, requestQueue){
    const products = $("div[class*=s-asin]:not([data-asin=''])[data-asin]").slice(0, 2); //For testing only take 2 urls

    Array.from(products).forEach((product) => {
        const ASIN_CODE = $(product).attr("data-asin");
        requestQueue.addRequest(
            {
                url: `${PRODUCT_URL}${ASIN_CODE}`,
                userData: {
                    label: 'PRODUCT',
                    code: ASIN_CODE
                },
                headers: HEADERS
            }
        );
    });
}

await crawler.run();