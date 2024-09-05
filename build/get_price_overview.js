const https = require('https');

const getPriceOverview = (country, currency, allAppIds) => [ allAppIds[0], allAppIds[1] ].reduce((chain, appIds, index) => {
    const requestCount = allAppIds.length;

    return chain.then((partial) =>
        new Promise((resolve) => {
            https.get(`https://store.steampowered.com/api/appdetails?appids=${appIds.join(',')}&filters=price_overview&cc=${country}`, res => {
                let data = [];
                const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                console.log('Status Code:', res.statusCode);
                console.log('Date in Response header:', headerDate);

                res.on('data', chunk => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    console.log(`All data chunks received for partial ${index + 1}/${requestCount} for ${currency}`);
                    const appsFr = JSON.parse(Buffer.concat(data).toString());    
                    resolve({
                        ...partial,
                        ...appsFr
                    });
                });
            });
        }));
    
}, Promise.resolve({}));

module.exports = { getPriceOverview };
