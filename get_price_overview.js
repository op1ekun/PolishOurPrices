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

// console.log('filteredAppIds', filteredAppIds);
const LIMIT = 1249;

const appDetalUrl = `https://store.steampowered.com/api/appdetails?appids=${filteredAppIds.slice(0,LIMIT).join(',')}&filters=price_overview&cc=en`

// console.log('appdetails url', appDetalUrl);

https.get(appDetalUrl, res => {
    let data = [];
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    console.log('Status Code:', res.statusCode);
    console.log('Date in Response header:', headerDate);
  
    res.on('data', chunk => {
        data.push(chunk);
    });
  
    res.on('end', () => {
        console.log('Response ended: ');
        // const appsFr = JSON.parse(Buffer.concat(data).toString());    
        fs.writeFileSync('./price_overview_fr.json', Buffer.concat(data).toString());    
    });
  }).on('error', err => {
    console.log('Error: ', err.message);
  });

