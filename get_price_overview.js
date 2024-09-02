const https = require('https');
const fs = require('fs');
const { applist: { apps } } = require('./applist.json');

const filteredAppIds = apps
    .filter(app => app.name && !app.name.match(/(^test)|(\s+test\s+)/))
    .reduce((acc, { appid }) => {
        acc.push(appid);
        return acc;
    }, []);

    // https://store.steampowered.com/api/appdetails?appids=57690,57000&filters=price_overview&cc=en


https.get(`https://store.steampowered.com/api/appdetails?appids=${filteredAppIds.join(',')}&filters=price_overview&cc=en`, res => {
    let data = [];
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    console.log('Status Code:', res.statusCode);
    console.log('Date in Response header:', headerDate);
  
    res.on('data', chunk => {
        data.push(chunk);
    });
  
    res.on('end', () => {
        console.log('Response ended: ');
        const appsFr = JSON.parse(Buffer.concat(data).toString());    
        fs.writeFileSync('./price_overview_fr.json', appsFr);    
    });
  });

