const { writeFileSync } = require('fs');
const { join } = require('path');

const diff5 = require('../api/diff5/index.json');
const review20 = require('../api/diff5/review20/index.json');
const overviewCHF = require('../api/indexCHF.json');
// const overview = require('../api/indexCHF.json');

// console.log('***', 'CHF', Object.keys(overviewCHF).length);
// console.log('***', 'og', Object.keys(overview).length);


Object.keys(diff5).forEach((appId) => {
    if (overviewCHF[appId]) {
        diff5[appId].priceOverview['CHF'] = overviewCHF[appId].priceOverview['CHF'];
    }
});

Object.keys(review20).forEach((appId) => {
    if (overviewCHF[appId]) {
        review20[appId].priceOverview['CHF'] = overviewCHF[appId].priceOverview['CHF'];
    }
});

// console.log('***', review20);

const diff5Dir = join(__dirname, '..', 'api', 'diff5');
writeFileSync(join(diff5Dir, 'index.json'), JSON.stringify(diff5));
const review20Dir = join(__dirname, '..', 'api', 'diff5', 'review20');
writeFileSync(join(review20Dir, 'index.json'), JSON.stringify(review20));