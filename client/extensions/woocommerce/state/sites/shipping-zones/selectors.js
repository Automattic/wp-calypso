/**
 * External dependencies
 */

import { every, get, isArray, some } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';
import {
	areShippingZoneMethodsLoaded,
	areShippingZoneMethodsLoading,
} from '../shipping-zone-methods/selectors';
import {
	areShippingZoneLocationsLoaded,
	areShippingZoneLocationsLoading,
} from '../shipping-zone-locations/selectors';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The list of shipping zones, as retrieved from the server. It can also be the string "LOADING"
 * if the zones are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
export const getAPIShippingZones = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingZones' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping zones list has been successfully loaded from the server
 */
export const areShippingZonesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	const zones = getAPIShippingZones( state, siteId );
	return (
		isArray( zones ) &&
		every( zones, ( zone ) => areShippingZoneMethodsLoaded( state, zone.id, siteId ) ) &&
		every( zones, ( zone ) => areShippingZoneLocationsLoaded( state, zone.id, siteId ) )
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping zones list is currently being retrieved from the server
 */
export const areShippingZonesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	const zones = getAPIShippingZones( state, siteId );
	if ( LOADING === zones ) {
		return true;
	}
	if ( ! isArray( zones ) ) {
		return false;
	}
	return (
		some( zones, ( zone ) => areShippingZoneMethodsLoading( state, zone.id, siteId ) ) ||
		some( zones, ( zone ) => areShippingZoneLocationsLoading( state, zone.id, siteId ) )
	);
};
