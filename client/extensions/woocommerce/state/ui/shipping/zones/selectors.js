/**
 * External dependencies
 */
import { get, find, findIndex, isNumber, remove } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAPIShippingZones, areShippingZonesLoaded } from '../../../wc-api/shipping-zones/selectors';

const getShippingZonesEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', siteId, 'shipping', 'zones' ] );
};

export const getShippingZones = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areShippingZonesLoaded( state, siteId ) ) {
		return [];
	}
	const zones = [ ...getAPIShippingZones( state, siteId ) ];
	const { creates, updates, deletes } = getShippingZonesEdits( state, siteId );
	deletes.forEach( ( { id } ) => remove( zones, { id } ) );
	updates.forEach( ( update ) => {
		const index = findIndex( zones, { id: update.id } );
		if ( -1 === index ) {
			return;
		}
		zones[ index ] = { ...zones[ index ], ...update };
	} );
	return [ ...zones, ...creates ];
};

export const getCurrentlyEditingShippingZone = ( state, siteId = getSelectedSiteId( state ) ) => {
	const { currentlyEditingId, currentlyEditingChanges } = getShippingZonesEdits( state, siteId );
	if ( null === currentlyEditingId ) {
		return null;
	}
	const zone = find( getShippingZones( state, siteId ), { id: currentlyEditingId } );
	if ( ! zone ) {
		return null;
	}
	return { ...zone, ...currentlyEditingChanges };
};

export const isCurrentlyEditingShippingZone = ( state, siteId = getSelectedSiteId( state ) ) => {
	return Boolean( getCurrentlyEditingShippingZone( state, siteId ) );
};

const isEditableShippingZone = ( zoneId ) => ! isNumber( zoneId ) || 0 !== zoneId;

export const canChangeShippingZoneTitle = isEditableShippingZone;

export const canRemoveShippingZone = isEditableShippingZone;

export const canEditShippingZoneLocations = isEditableShippingZone;
