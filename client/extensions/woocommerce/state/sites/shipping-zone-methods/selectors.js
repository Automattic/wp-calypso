/** @format */
/**
 * External dependencies
 */
import { find, get, isArray, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAPIShippingZones } from '../shipping-zones/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getAPIShippingZoneMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingZoneMethods' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} id Shipping Zone Method ID to get
 * @param {Number} [siteId] Site ID to get. If not provided, the Site ID selected in the UI will be used
 * @return {Object|null} The shipping zone method definition, or null if it wasn't found
 */
export const getShippingZoneMethod = ( state, id, siteId = getSelectedSiteId( state ) ) => {
	const methods = getAPIShippingZoneMethods( state, siteId );
	if ( ! isObject( methods ) ) {
		return null;
	}
	return methods[ id ];
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} zoneId Shipping Zone ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods for the given zone have been successfully loaded from the server
 */
export const areShippingZoneMethodsLoaded = (
	state,
	zoneId,
	siteId = getSelectedSiteId( state )
) => {
	const zones = getAPIShippingZones( state, siteId );
	if ( ! isArray( zones ) ) {
		return false;
	}
	const zone = find( zones, { id: zoneId } );
	return zone && isArray( zone.methodIds );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} zoneId Shipping Zone ID to check
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods for the given zone are currently being retrieved from the server
 */
export const areShippingZoneMethodsLoading = (
	state,
	zoneId,
	siteId = getSelectedSiteId( state )
) => {
	const zones = getAPIShippingZones( state, siteId );
	if ( ! isArray( zones ) ) {
		return false;
	}
	const zone = find( zones, { id: zoneId } );
	return zone && LOADING === zone.methodIds;
};
