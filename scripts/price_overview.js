// https://api.steampowered.com/ISteamApps/GetAppList/v2/
// https://store.steampowered.com/api/appdetails?appids=57690,57000&filters=price_overview&cc=fr
const BASE_URL = 'steampowered.com';

const APPS = 'ISteamApps';
const APP_LIST = 'GetAppList';

const APP_DETAILS = 'appdetails';
const APP_IDS = 'appids';

(() => {
    const appListUrl = `http://api.${BASE_URL}/${APPS}/${APP_LIST}/v2/`;

    fetch(appListUrl, { mode: 'no-cors' })
        .then(response => response.json())
        .then((apps) => console.log('apps count', apps?.applist?.length));
})()