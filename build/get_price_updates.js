const notPolishedApps = require('../api/diff5/review20/index.json');
const { appIdsPerRequestLimit } = require('./constants');
const { getPriceOverview } = require('./get_price_overview');
const { currencyToCountry } = require('./constants');

const appNameById = {};

const start = new Date().getTime();
const groupedAppIds = Object.keys(notPolishedApps)
    .reduce((appIds, appid, index) => {
        const { name } = notPolishedApps[appid];
        appNameById[appid] = name;

        const appIdsIndex = Math.floor(index / appIdsPerRequestLimit);

        if (!appIds[appIdsIndex]) {
            // console.log('***', appIdsIndex);
            appIds[appIdsIndex] = [];
        }

        appIds[appIdsIndex].push(appid);

        return appIds;
    }, []);

// console.log('***', groupedAppIds);

const allRequests = [ 'PLN', 'EUR' ].map((currency) => {
    const country = currencyToCountry[currency];
    console.log(country, currency);
    // return getPriceOverview(country, currency, [ groupedAppIds[0], groupedAppIds[1], groupedAppIds[2] ], true);
    return getPriceOverview(country, currency, groupedAppIds, true);
});

// [
//     [
//         { '2280': [Object], '4230': [Object], '4520': [Object] },
//         { '4560': [Object], '7510': [Object], '7520': [Object] },
//         { '7800': [Object], '9340': [Object], '9460': [Object] }
//     ],
//     [
//         { '2280': [Object], '4230': [Object], '4520': [Object] },
//         { '4560': [Object], '7510': [Object], '7520': [Object] },
//         { '7800': [Object], '9340': [Object], '9460': [Object] }
//     ]
// ]
Promise.all(allRequests)
    .then(results => results.flat())
    // .then(results => console.log('***', Object.keys(results).length, results, results[0]['2280']))
    .then(results => {
        // console.log('***', results);
        return results.reduce((updates, curr) => {
            // console.log('***', curr);
            Object.keys(curr).forEach(appId => {
                const { data } = curr[appId];

                if (!data || !data.price_overview) {
                    console.log('***', appId, curr[appId]);
                    return updates;
                }

                const { price_overview } = data;

                if (!updates[appId]) {
                    updates[appId] = {
                        name: appNameById[appId],
                        priceOverview: {},
                    };
                }
            
                updates[appId].priceOverview = {
                    ...updates[appId].priceOverview,
                    [price_overview.currency]: price_overview,
                };
            });
            return updates;
        }, {})
    })
    .then(updates => {
        // console.log('***', updates, updates['2280']);
        console.log('***', new Date().getTime() - start, 'ms');
    })
