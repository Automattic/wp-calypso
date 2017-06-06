/**
 * External dependencies
 */
import { get, find, findIndex, isNumber, remove } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAPIShippingZones, areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';

const getShippingZonesEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', siteId, 'shipping', 'zones' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of shipping zones that the UI should show. That will be the list of zones returned by
 * the wc-api with the edits "overlayed" on top of them.
 */
export const getShippingZones = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areShippingZonesLoaded( state, siteId ) ) {
		return [];
	}
	const zones = [ ...getAPIShippingZones( state, siteId ) ];

	const edits = getShippingZonesEdits( state, siteId );
	if ( ! edits ) {
		return zones;
	}

	// Overlay the current edits on top of (a copy of) the wc-api zones
	const { creates, updates, deletes } = edits;
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

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object|null} The shipping zone that's currently being edited, with all the edits
 * (including the non-committed changes). If no zone is being edited, this will return null.
 */
export const getCurrentlyEditingShippingZone = ( state, siteId = getSelectedSiteId( state ) ) => {
	const edits = getShippingZonesEdits( state, siteId );
	if ( ! edits ) {
		return null;
	}
	if ( null === edits.currentlyEditingId ) {
		return null;
	}
	const zone = find( getShippingZones( state, siteId ), { id: edits.currentlyEditingId } );
	if ( ! zone ) {
		return null;
	}
	return { ...zone, ...edits.currentlyEditingChanges };
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the user is currently editing a shipping zone.
 */
export const isCurrentlyEditingShippingZone = ( state, siteId = getSelectedSiteId( state ) ) => {
	return Boolean( getCurrentlyEditingShippingZone( state, siteId ) );
};

/**
 * @param {Number|Object} zoneId Zone ID (can be a temporal ID)
 * @return {Boolean} Whether this zone is considered "editable". As a rule, every zone is editable,
 * except the "Rest Of The World" zone, which always has id = 0.
 */
const isEditableShippingZone = ( zoneId ) => ! isNumber( zoneId ) || 0 !== zoneId;

/**
 * @param {Number|Object} zoneId Zone ID (can be a temporal ID)
 * @return {Boolean} Whether the name of this shipping zone can be changed by the user
 */
export const canChangeShippingZoneTitle = isEditableShippingZone;

/**
 * @param {Number|Object} zoneId Zone ID (can be a temporal ID)
 * @return {Boolean} Whether this shipping zone can be deleted
 */
export const canRemoveShippingZone = isEditableShippingZone;

/**
 * @param {Number|Object} zoneId Zone ID (can be a temporal ID)
 * @return {Boolean} Whether the locations this zone represents can be altered.
 */
export const canEditShippingZoneLocations = isEditableShippingZone;
