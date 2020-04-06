/**
 * External dependencies
 */

import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The currencies data, as retrieved from the server. It can also be the string "LOADING"
 * if the currencies are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
const getRawCurrencies = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, `extensions.woocommerce.sites[${ siteId }].data.currencies` );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the currencies data has been successfully loaded from the server
 */
export const areCurrenciesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawCurrencies( state, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the currencies data is currently being retrieved from the server
 */
export const areCurrenciesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawCurrencies( state, siteId );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} A list of currencies, represented by { code, name, symbol }.
 */
export const getCurrencies = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areCurrenciesLoaded( state, siteId ) ) {
		return [];
	}
	return getRawCurrencies( state, siteId );
};
