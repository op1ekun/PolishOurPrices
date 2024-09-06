const https = require('https');
const { writeFileSync, mkdir }  = require('fs');
const { join } = require('path');
const priceOverview = require('../api/index.json');

https.get('https://api.nbp.pl/api/exchangerates/tables/A/today/?format=json', res => {
    let data = [];

    res.on('data', (chunk) => {
        data.push(chunk);
    });

    res.on('end', () => {
        const [ { rates }] = JSON.parse(Buffer.concat(data).toString());
        const eurFx = rates.find((curr) => curr.code === 'EUR');
        console.log('midFx', eurFx);

        const diff5Dir = join(__dirname, '..', 'api', 'diff5');
        mkdir(diff5Dir, () => {
            writeFileSync(join(diff5Dir, 'index.json'), JSON.stringify(findNotPolished(eurFx, priceOverview, 5, 5)));
        });
    });

});

const findNotPolished = (eurFx, priceOverview, percentThreshold, monetaryThreshold) => Object.keys(priceOverview).reduce((apps, currAppId) => {
    const curr = priceOverview[currAppId];
    const finalPLN = curr.priceOverview.PLN?.final ? curr.priceOverview.PLN?.final * 0.01 : undefined;
    const finalEUR = curr.priceOverview.EUR?.final ? curr.priceOverview.EUR?.final * 0.01 : undefined;

    if (!finalEUR || !finalPLN) return apps;

    // as fraction for easier calc, and precision
    const percentDiff = (1 - ((finalEUR / (finalPLN / eurFx.mid))));

    if (percentDiff > (percentThreshold / 100) && (finalPLN * percentDiff >= monetaryThreshold)) {
        console.log('***', 'percent diff', Number.parseFloat(percentDiff, 10).toFixed(2), '%');
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

