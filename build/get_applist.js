const getApplist = () => new Promise((resolve) => {
    const requestLimit = 1000;
    let filteredAppIds = [];
    let appNameById = {};
    let appIdsIndex = 0;

    // get all apps list
    https.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/', res => {
        let data = [];

        console.log('Status Code:', res.statusCode);
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Date in Response header:', headerDate);
        
        res.on('data', chunk => {
            data.push(chunk);
        });
        res.on('end', () => {
            console.log('All data chunks received for applist');
            const { applist : { apps }} = JSON.parse(Buffer.concat(data).toString());
            for (let i = 0; i < apps.length; i++) {
                const { appid, name } = apps[i];
                if (name && !name.match(/(^test)|(\s+test\s+)/)) {
                    if (!filteredAppIds[appIdsIndex]) {
                        filteredAppIds[appIdsIndex] = [];
                    }
                    
                    // package app ids by request limit (one request can process ~1000 ids at once)
                    if (filteredAppIds[appIdsIndex].length === requestLimit) {
                        appIdsIndex++;
                        filteredAppIds[appIdsIndex] = [];
                    }
                    filteredAppIds[appIdsIndex].push(appid);
                    // create lookup table for name
                    appNameById[appid] = name;
                }
            }

            resolve({
                filteredAppIds,
                appNameById
            });
        })
    });
});

exports = { getApplist };