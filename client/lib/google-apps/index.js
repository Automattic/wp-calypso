/**
 * Constants
 */
const GOOGLE_APPS_LINK_PREFIX = 'https://mail.google.com/a/';

function googleAppsSettingsUrl(domainName) {
    return GOOGLE_APPS_LINK_PREFIX + domainName;
}

export { googleAppsSettingsUrl };
