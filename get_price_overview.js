const https = require('https');
const fs = require('fs');
const { applist: { apps } } = require('./applist.json');

const requestLimit = 1000;
let appIdsIndex = 0;

const filteredAppIds = apps
    .filter(app => app.name && !app.name.match(/(^test)|(\s+test\s+)/))
    .reduce((arr, { appid }) => {
        if (!arr[appIdsIndex]) {
            arr[appIdsIndex] = [];
        }
      
        if (arr[appIdsIndex].length === requestLimit) {
            appIdsIndex++;
            arr[appIdsIndex] = [];
        }
        arr[appIdsIndex].push(appid);
      
        return arr;
    }, []);

const currencyToCountry = {
    'PLN': 'pl',
    'EUR': 'de',
    'GBP': 'gb',
    'NOK': 'no',
    'USD': 'en'
};

Object.keys(currencyToCountry).forEach((currency) => {
    const country = currencyToCountry[currency];

    [ filteredAppIds[0] ]
        .reduce((chain, appIds) => {
            return chain.then((partial) => {
                return new Promise((resolve) => {
                    https.get(`https://store.steampowered.com/api/appdetails?appids=${appIds.join(',')}&filters=price_overview&cc=${country}`, res => {
                        let data = [];
                        console.log(currency);
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
            });
        });
    }, Promise.resolve({}))
    .then((result) => {
        console.log("result", result);
        fs.writeFileSync(`./price_overview_${currency}.json`, JSON.stringify(result));
    });
});