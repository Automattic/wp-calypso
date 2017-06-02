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
 * @return {Object} The list of shipping zones, as retrieved fro the server. It can also be  the string "LOADING"
 * if the zones are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
export const getAPIShippingZones = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'wcApi', siteId, 'shippingZones' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping zones list has been successfully loaded from the server
 */
export const areShippingZonesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getAPIShippingZones( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping zones list is currently being retrieved from the server
 */
export const areShippingZonesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getAPIShippingZones( state, siteId );
};
