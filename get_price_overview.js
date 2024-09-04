const https = require('https');
const fs = require('fs');
const { applist: { apps } } = require('./applist.json');

const requestLimit = 1000;
let appIdsIndex = 0;

let filteredAppIds = [];
let appNameById = {};
for (let i = 0; i < apps.length; i++) {
    const { appid, name } = apps[i];
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

// const filteredAppIds = apps
//     .filter(app => app.name && !app.name.match(/(^test)|(\s+test\s+)/))
//     .reduce((arr, { appid }) => {
//         if (!arr[appIdsIndex]) {
//             arr[appIdsIndex] = [];
//         }
      
//         if (arr[appIdsIndex].length === requestLimit) {
//             appIdsIndex++;
//             arr[appIdsIndex] = [];
//         }
//         arr[appIdsIndex].push(appid);
      
//         return arr;
//     }, []);

const currencyToCountry = {
    'PLN': 'pl',
    'EUR': 'de',
    'GBP': 'gb',
    'NOK': 'no',
    'USD': 'en'
};

const getPriceOverview = (country, currency) => [ filteredAppIds[0] ].reduce((chain, appIds) => 
    chain.then((partial) =>
        new Promise((resolve) => {
            https.get(`https://store.steampowered.com/api/appdetails?appids=${appIds.join(',')}&filters=price_overview&cc=${country}`, res => {
                let data = [];
                console.log('retrieving', currency);
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
    })
), Promise.resolve({}));


Object.keys(currencyToCountry).reduce((chain, currency) => {
    const country = currencyToCountry[currency];

    return chain.then((overview) =>
        getPriceOverview(country, currency).then((result) => {
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
}, Promise.resolve({})).then((overview) => {
    fs.writeFileSync(`./price_overview.json`, JSON.stringify(overview));
})
