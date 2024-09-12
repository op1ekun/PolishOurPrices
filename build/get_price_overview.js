const https = require('https');

const getPriceOverview = (country, currency, allAppIds, parallel = false) => { 
    const requestCount = allAppIds.length;
    const params = { country, currency, requestCount };

    if (parallel) {
        const allOvieviewPromises = allAppIds.map(
            (appIds, index) => resolvePartial({ ...params, appIds, index })({})
        );

        return Promise.all(allOvieviewPromises);
    } else {
        return allAppIds.reduce(
            (chain, appIds, index) => chain.then(resolvePartial({ ...params, appIds, index })),
            Promise.resolve({})
        );
    }
};

const resolvePartial = ({ appIds, country, index, requestCount, currency }) => 
    (partial) => new Promise((resolve) => {
        const overviewUrl = `https://store.steampowered.com/api/appdetails?appids=${appIds.join(',')}&filters=price_overview&cc=${country}`;
        // console.log('***', overviewUrl);
        
        https.get(overviewUrl, res => {
            let data = [];
            const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
            console.log('Status Code:', res.statusCode);
            console.log('Date in Response header:', headerDate);

            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', () => {
                console.log(`All data chunks received for partial ${index + 1}/${requestCount} for ${currency}`);
                console.log('data');
                const appsFr = JSON.parse(Buffer.concat(data).toString());    
                resolve({
                    ...partial,
                    ...appsFr
                });
            });

            res.on('error', (err) => {
                console.error(err);
            });
        });
    });

module.exports = { getPriceOverview };
