const https = require('https');
const {
    pricePercentThreshold,
    priceMonetaryThreshold
} = require('./constants');

const findNotPolished = (eurFx, priceOverview, percentThreshold, monetaryThreshold) => Object.keys(priceOverview).reduce((apps, currAppId) => {
    const curr = priceOverview[currAppId];
    const finalPLN = curr.priceOverview.PLN?.final ? curr.priceOverview.PLN?.final * 0.01 : undefined;
    const finalEUR = curr.priceOverview.EUR?.final ? curr.priceOverview.EUR?.final * 0.01 : undefined;

    // eject early
    if (!finalEUR || !finalPLN) return apps;

    const finalPLNinEUR = finalPLN / eurFx.mid;
    // as fraction for easier calc, and precision
    const percentDiff = (1 - ((finalEUR / finalPLNinEUR)));

    if (percentDiff > (percentThreshold / 100) && (finalPLN * percentDiff >= monetaryThreshold)) {
        // console.log('***', 'percent diff', Number.parseFloat(percentDiff * 100, 10).toFixed(2), '%');
        apps[currAppId] = {
            ...curr,
            notPolished: {
                percentDiff,
                monetaryDiffPLN: finalPLN * percentDiff
            } 
        }
    }

    return apps;
}, {});

const getNotPolished = (priceOverview) => new Promise((resolve) => {
    https.get('https://api.nbp.pl/api/exchangerates/tables/A/today/?format=json', res => {
        let data = [];
    
        res.on('data', (chunk) => {
            data.push(chunk);
        });
    
        res.on('end', () => {
            const [ { rates } ] = JSON.parse(Buffer.concat(data).toString());
            const eurFx = rates.find((curr) => curr.code === 'EUR');
            resolve(findNotPolished(eurFx, priceOverview, pricePercentThreshold, priceMonetaryThreshold));
        });
    });
});

module.exports = { getNotPolished };