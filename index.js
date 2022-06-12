import Apify from 'apify';
import cheerio from 'cheerio';
import { SEARCHED_URL, PRODUCT_URL, HEADERS } from "./constants.js";

await Apify.utils.purgeLocalStorage();

const requestQueue = await Apify.openRequestQueue();

const keyword = await Apify.getInput() || "phone";

await requestQueue.addRequest({
    url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
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
                //We store the product generic information
                products[request.userData.code] = {
                    title: $('#title').text().trim(),
                    url: response.url,
                    description: $('#whatsInTheBoxDeck').text().trim().replace(/\s\s+/g, ": "),
                    keyword: keyword
                }

                //Initialice the array where we will save the different offers by AMAZON asin code
                offers[request.userData.code] = [];

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
    const products = $("div[class*=s-asin]:not([data-asin=''])[data-asin]");

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