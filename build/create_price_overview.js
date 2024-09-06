const fs = require('fs');
const { getApplist } = require('./get_applist');
const { getPriceOverview } = require('./get_price_overview');
const { currencyToCountry } = require('./currency_to_country');

getApplist()
.then(({ filteredAppIds, appNameById }) => Object.keys(currencyToCountry)
    .reduce((chain, currency) => {
        const country = currencyToCountry[currency];

        return chain.then((overview) =>
            getPriceOverview(country, currency, filteredAppIds).then((result) => {
                Object.keys(result).forEach((appId) => {
                    if (
                        result[appId] &&
                        result[appId].success &&
                        !Array.isArray(result[appId].data)
                    ) {
                        if (!overview[appId]) {
                            overview[appId] = {
                                name: appNameById[appId],
                                priceOverview: {},
                            };
                        }
                    
                        overview[appId].priceOverview = {
                            ...overview[appId].priceOverview,
                            [currency]: result[appId].data.price_overview,
                        };
                    }
                });

                return overview;
            }));
        }, Promise.resolve({}))

)
.then((overview) => {
    console.log('Writing overview');
    // fs.writeFileSync(`./price_overview.json`, JSON.stringify(overview));
    // test static API capabilities
    fs.writeFileSync(`./api/index.json`, JSON.stringify(overview));
    console.log('Writing overview - finished');
})
