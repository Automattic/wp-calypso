export const PAID_DOMAINS_TO_SHOW = 5;
export const PAID_DOMAINS_TO_SHOW_EXPANDED = 10;

/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 *
 * @see https://stackoverflow.com/a/44755058/1432801
 */
export const DOMAIN_SEARCH_DEBOUNCE_INTERVAL = 300;

export const DOMAIN_SUGGESTIONS_STORE = 'automattic/domains/suggestions';

export const domainIsAvailableStatus = [ 'available', 'available_premium' ];
