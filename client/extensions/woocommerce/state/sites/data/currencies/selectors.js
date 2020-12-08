/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The currencies data, as retrieved from the server. It can also be the string "LOADING"
 * if the currencies are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
function getRawCurrencies( state, siteId = getSelectedSiteId( state ) ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.data.currencies;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the currencies data has been successfully loaded from the server
 */
export function areCurrenciesLoaded( state, siteId = getSelectedSiteId( state ) ) {
	return Array.isArray( getRawCurrencies( state, siteId ) );
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the currencies data is currently being retrieved from the server
 */
export function areCurrenciesLoading( state, siteId = getSelectedSiteId( state ) ) {
	return getRawCurrencies( state, siteId ) === LOADING;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} A list of currencies, represented by { code, name, symbol }.
 */
export function getCurrencies( state, siteId = getSelectedSiteId( state ) ) {
	if ( ! areCurrenciesLoaded( state, siteId ) ) {
		return [];
	}
	return getRawCurrencies( state, siteId );
}
