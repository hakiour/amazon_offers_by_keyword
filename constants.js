
const _BASE_URL = "https://www.amazon.com/";
const _URLS_SEARCH_PARAMETERS = "s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=";
const _PRODUCT_URL_PARAMETER = "dp/";

const _SEARCHED_URL = `${_BASE_URL}${_URLS_SEARCH_PARAMETERS}`;
const _PRODUCT_URL = `${_BASE_URL}${_PRODUCT_URL_PARAMETER}`;

export { _BASE_URL as BASE_URL };
export { _SEARCHED_URL as SEARCHED_URL };
export { _PRODUCT_URL as PRODUCT_URL };

export const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1"
}