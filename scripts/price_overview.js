// https://api.steampowered.com/ISteamApps/GetAppList/v2/
// https://store.steampowered.com/api/appdetails?appids=57690,57000&filters=price_overview&cc=fr
const BASE_URL = 'steampowered.com';

const APPS = 'ISteamApps';
const APP_LIST = 'GetAppList';

const APP_DETAILS = 'appdetails';
const APP_IDS = 'appids';

(async () => {
    const appListUrl = `//api.${BASE_URL}/${APPS}/${APP_LIST}/v2/`;

    try {
        const response = await fetch(appListUrl);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
    
        const apps = await response.json();
        console.log('apps count', apps?.applist?.length);
    } catch (error) {
        console.error(error.message);
    }
})()