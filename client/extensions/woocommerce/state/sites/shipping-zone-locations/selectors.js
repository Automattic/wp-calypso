/**
 * External dependencies
 */
import { get, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getRawShippingZoneLocations = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingZoneLocations' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} zoneId Shipping Zone ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the locations for the given zone have been successfully loaded from the server
 */
export const areShippingZoneLocationsLoaded = ( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
	const rawLocations = getRawShippingZoneLocations( state, siteId );
	return rawLocations && isObject( rawLocations[ zoneId ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} zoneId Shipping Zone ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the locations for the given zone are currently being retrieved from the server
 */
export const areShippingZoneLocationsLoading = ( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
	const rawLocations = getRawShippingZoneLocations( state, siteId );
	return rawLocations && LOADING === getRawShippingZoneLocations( state, siteId )[ zoneId ];
};
