const https = require('https');
const { minimumReviewsCount } = require('./constants');

const getFilteredByReviews = (notPolished) => {
    const requestCount = Object.keys(notPolished).length;

    return Object.keys(notPolished).reduce((chain, appid, index) =>
        chain.then((partial) => new Promise((resolve) => {
            const reviewsURL = `https://store.steampowered.com/appreviews/${appid}?json=1`;
        
            https.get(reviewsURL, res => {
                let data = [];

                console.log('Status Code:', res.statusCode);
                const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                console.log('Date in Response header:', headerDate);

                res.on('data', (chunk) => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    console.log(`All data received for ${appid} - request ${index + 1}/${requestCount}`);
                    const { success, query_summary } = JSON.parse(Buffer.concat(data).toString());
                    if (success && query_summary?.total_reviews && query_summary?.total_reviews >= minimumReviewsCount) {
                        resolve({
                            ...partial,
                            [appid]: { ...notPolished[appid] },
                        });
                    } else {
                        resolve(partial);
                    }
                });
            })

        })), Promise.resolve({}))
};

module.exports = { getFilteredByReviews };