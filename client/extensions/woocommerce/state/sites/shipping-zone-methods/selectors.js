/**
 * External dependencies
 */

import { every, find, get, isArray, isObject, some, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAPIShippingZones } from '../shipping-zones/selectors';
import { LOADING } from 'woocommerce/state/constants';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';
import {
	isShippingZoneMethodSettingsLoaded,
	isShippingZoneMethodSettingsLoading,
} from 'woocommerce/woocommerce-services/state/shipping-zone-method-settings/selectors';

const getAPIShippingZoneMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingZoneMethods' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} id Shipping Zone Method ID to get
 * @param {number} [siteId] Site ID to get. If not provided, the Site ID selected in the UI will be used
 * @returns {object|null} The shipping zone method definition, or null if it wasn't found
 */
export const getShippingZoneMethod = ( state, id, siteId = getSelectedSiteId( state ) ) => {
	const methods = getAPIShippingZoneMethods( state, siteId );
	if ( ! isObject( methods ) ) {
		return null;
	}
	return methods[ id ];
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId Shipping Zone ID to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping methods for the given zone have been successfully loaded from the server
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
	if ( ! zone || ! isArray( zone.methodIds ) ) {
		return false;
	}
	if ( ! isWcsEnabled( state, siteId ) ) {
		return true;
	}
	const wcsMethods = zone.methodIds
		.map( ( id ) => {
			const method = getShippingZoneMethod( state, id, siteId );
			if ( ! method || ! startsWith( method.methodType, 'wc_services' ) ) {
				return null;
			}
			return method;
		} )
		.filter( Boolean );
	return every( wcsMethods, ( { id } ) => isShippingZoneMethodSettingsLoaded( state, id, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId Shipping Zone ID to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping methods for the given zone are currently being retrieved from the server
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
	if ( ! zone ) {
		return false;
	}
	if ( LOADING === zone.methodIds ) {
		return true;
	}
	if ( ! isWcsEnabled( state, siteId ) || ! isArray( zone.methodIds ) ) {
		return false;
	}
	const wcsMethods = zone.methodIds
		.map( ( id ) => {
			const method = getShippingZoneMethod( state, id, siteId );
			if ( ! method || ! startsWith( method.methodType, 'wc_services' ) ) {
				return null;
			}
			return method;
		} )
		.filter( Boolean );
	return some( wcsMethods, ( { id } ) => isShippingZoneMethodSettingsLoading( state, id, siteId ) );
};
