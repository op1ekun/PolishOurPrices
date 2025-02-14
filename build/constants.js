const currencyToCountry = {
    'PLN': 'pl',
    'EUR': 'de',
    'GBP': 'gb',
    'NOK': 'no',
    'USD': 'en',
    'CHF': 'ch'
};

// 5%
const pricePercentThreshold = 5;
// 5PLN
const priceMonetaryThreshold = 5;
const minimumReviewsCount = 20;

const appIdsPerRequestLimit = 700;

module.exports =  {
    currencyToCountry,
    pricePercentThreshold,
    priceMonetaryThreshold,
    minimumReviewsCount,
    appIdsPerRequestLimit
};