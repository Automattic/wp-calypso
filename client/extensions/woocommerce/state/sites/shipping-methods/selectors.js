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
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The list of shipping methods, as retrieved from the server. It can also be the string "LOADING"
 * if the methods are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
export const getShippingMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingMethods' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods list has been successfully loaded from the server
 */
export const areShippingMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getShippingMethods( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods list is currently being retrieved from the server
 */
export const areShippingMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getShippingMethods( state, siteId );
};
