const { writeFileSync, mkdir }  = require('fs');
const { join } = require('path');
const priceOverview = require('../api/index.json');
const { getNotPolished } = require('./get_not_polished');
const { getFilteredByReviews } = require('./get_filtered_by_reviews');

getNotPolished(priceOverview)
.then((notPolished) => {
    const diff5Dir = join(__dirname, '..', 'api', 'diff5');
    return new Promise((resolve) => {
        mkdir(diff5Dir, () => {
            console.log('Generating diff5 API endpoint...');
            writeFileSync(join(diff5Dir, 'index.json'), JSON.stringify(notPolished));
            console.log('Generating diff5 API endpoint - finished');
            resolve(notPolished);
        });
    });
})
.then(getFilteredByReviews)
.then((filteredByReviews) => {
    const review20Dir = join(__dirname, '..', 'api', 'diff5', 'review20');

    mkdir(review20Dir, () => {
        console.log('Generating review20 API endpoint...');
        writeFileSync(join(review20Dir, 'index.json'), JSON.stringify(filteredByReviews));
        console.log('Generating review20 API endpoint - finished');
    });
});
