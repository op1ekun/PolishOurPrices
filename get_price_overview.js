const https = require('https');
const fs = require('fs');

const requestLimit = 1000;
let appIdsIndex = 0;

const currencyToCountry = {
    'PLN': 'pl',
    'EUR': 'de',
    'GBP': 'gb',
    'NOK': 'no',
    'USD': 'en'
};

const getPriceOverview = (country, currency, allAppIds) => [ allAppIds[0] ].reduce((chain, appIds, index) => {
    const requestCount = allAppIds.length;

    return chain.then((partial) =>
        new Promise((resolve) => {
            https.get(`https://store.steampowered.com/api/appdetails?appids=${appIds.join(',')}&filters=price_overview&cc=${country}`, res => {
                let data = [];
                console.log(`retrieved price overview partial ${index + 1}/${requestCount} for ${currency}`);
                const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                console.log('Status Code:', res.statusCode);
                console.log('Date in Response header:', headerDate);

                res.on('data', chunk => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    console.log('Response ended: ');
                    const appsFr = JSON.parse(Buffer.concat(data).toString());    
                    resolve({
                        ...partial,
                        ...appsFr
                    });
                });
            });
        }));
    
}, Promise.resolve({}));

new Promise((resolve) => {
    let filteredAppIds = [];
    let appNameById = {};

    https.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/', res => {
        let data = [];

        console.log('Status Code:', res.statusCode);
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Date in Response header:', headerDate);
        
        res.on('data', chunk => {
            data.push(chunk);
        });
        res.on('end', () => {
            console.log('Response ended: ', res.statusCode);
            const applist = JSON.parse(Buffer.concat(data).toString());
            for (let i = 0; i < applist.length; i++) {
                const { appid, name } = applist[i];
                if (name && !name.match(/(^test)|(\s+test\s+)/)) {
                    if (!filteredAppIds[appIdsIndex]) {
                        filteredAppIds[appIdsIndex] = [];
                    }
                    
                    if (filteredAppIds[appIdsIndex].length === requestLimit) {
                        appIdsIndex++;
                        filteredAppIds[appIdsIndex] = [];
                    }
                    filteredAppIds[appIdsIndex].push(appid);
                    appNameById[appid] = name;
                }
            }

            resolve({
                filteredAppIds,
                appNameById
            });
        })
    });
})
.then(({ filteredAppIds, appNameById }) => {
    console.log('***', filteredAppIds, appIdsIndex);

    return Object.keys(currencyToCountry).reduce((chain, currency) => {
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
        }, Promise.resolve({}));

})
.then((overview) => {
    console.log('***', 'writing overview');
    fs.writeFileSync(`./price_overview.json`, JSON.stringify(overview));
    // test static API capabilities
    fs.writeFileSync(`./index.json`, JSON.stringify(overview));
})






