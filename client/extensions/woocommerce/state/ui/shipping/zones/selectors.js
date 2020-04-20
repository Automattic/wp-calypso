/**
 * External dependencies
 */

import { get, find, findIndex, flatten, isNumber, map, remove, some } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getAPIShippingZones,
	areShippingZonesLoaded,
} from 'woocommerce/state/sites/shipping-zones/selectors';
import { getShippingZoneMethods } from './methods/selectors';
import {
	getCurrentlyEditingShippingZoneLocationsList,
	getShippingZoneLocationsList,
} from './locations/selectors';

export const getShippingZonesEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'zones' ] );
};

const orderShippingZones = ( zones ) => {
	return [ ...zones ].sort( ( z1, z2 ) => {
		//newly added zones should be on top and sorted by creation order
		if ( ! isNumber( z1.id ) && ! isNumber( z2.id ) ) {
			return z1.id.index - z2.id.index;
		}

		if ( ! isNumber( z1.id ) ) {
			return -1;
		}

		if ( ! isNumber( z2.id ) ) {
			return 1;
		}

		//Locations not covered by your other zones should always be at the bottom
		if ( 0 === z1.id ) {
			return 1;
		}

		if ( 0 === z2.id ) {
			return -1;
		}

		//Order by the order of creation, unless overriden
		if ( z1.order === z2.order ) {
			return z1.id - z2.id;
		}

		return z1.order - z2.order;
	} );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of shipping zones that the UI should show. That will be the list of zones returned by
 * the wc-api with the edits "overlayed" on top of them.
 */
export const getShippingZones = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingZonesLoaded( state, siteId ) ) {
			return [];
		}
		const zones = [ ...getAPIShippingZones( state, siteId ) ];

		const edits = getShippingZonesEdits( state, siteId );
		if ( ! edits ) {
			return orderShippingZones( zones );
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
		return orderShippingZones( [ ...zones, ...creates ] );
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areShippingZonesLoaded( state, siteId );
		return [
			siteId,
			loaded,
			loaded && getAPIShippingZones( state, siteId ),
			loaded && getShippingZonesEdits( state, siteId ),
		];
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object|null} The shipping zone that's currently being edited, with all the edits
 * (including the non-committed changes). If no zone is being edited, this will return null.
 */
export const getCurrentlyEditingShippingZone = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const edits = getShippingZonesEdits( state, siteId );
		if ( ! edits ) {
			return null;
		}
		if ( null === edits.currentlyEditingId ) {
			return null;
		}
		const zone = find( getShippingZones( state, siteId ), { id: edits.currentlyEditingId } );
		if ( ! zone ) {
			return { id: edits.currentlyEditingId, ...edits.currentlyEditingChanges };
		}
		return { ...zone, ...edits.currentlyEditingChanges };
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const edits = getShippingZonesEdits( state, siteId );
		return [
			siteId,
			edits,
			edits && null !== edits.currentlyEditingId && getShippingZones( state, siteId ),
		];
	}
);

/**
 * @param {Array} locations List of locations for the zone.
 * @returns {string} The auto-generated name for the zone.
 */
const generateZoneNameFromLocations = ( locations ) => {
	if ( ! locations || ! locations.length ) {
		return translate( 'New shipping zone' );
	}

	const locationNames = locations.map( ( { name, postcodeFilter } ) =>
		postcodeFilter ? `${ name } (${ postcodeFilter })` : name
	);

	if ( locationNames.length > 10 ) {
		const remaining = locationNames.length - 10;
		const listed = locationNames.slice( 0, 10 );
		return translate(
			'%(locationList)s and %(count)s other region',
			'%(locationList)s and %(count)s other regions',
			{
				count: remaining,
				args: {
					locationList: listed.join( ', ' ),
					count: remaining,
				},
			}
		);
	}

	return locationNames.join( ', ' );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId ID of the shipping zone.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The auto-generated name for the zone, based in its locations. It doesn't include local edits.
 */
export const generateZoneName = ( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
	const locations = getShippingZoneLocationsList( state, zoneId, 20, siteId );
	return generateZoneNameFromLocations( locations );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The auto-generated name for the zone currently being edited, based in its locations. It includes local edits.
 */
export const generateCurrentlyEditingZoneName = ( state, siteId = getSelectedSiteId( state ) ) => {
	const locations = getCurrentlyEditingShippingZoneLocationsList( state, 20, siteId );
	return generateZoneNameFromLocations( locations );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the user is currently editing a shipping zone.
 */
export const isCurrentlyEditingShippingZone = ( state, siteId = getSelectedSiteId( state ) ) => {
	return Boolean( getCurrentlyEditingShippingZone( state, siteId ) );
};

export const areAnyShippingMethodsEnabled = ( state, siteId = getSelectedSiteId( state ) ) => {
	const zones = getShippingZones( state, siteId );
	const methods = flatten( zones.map( ( { id } ) => getShippingZoneMethods( state, id, siteId ) ) );
	return some( map( methods, 'enabled' ) );
};

/**
 * @param {number|object} zoneId Zone ID (can be a temporal ID)
 * @returns {boolean} Whether this zone is considered "editable". As a rule, every zone is editable,
 * except the "Locations not covered by your other zones" zone, which always has id = 0.
 */
const isEditableShippingZone = ( zoneId ) => ! isNumber( zoneId ) || 0 !== zoneId;

/**
 * @param {number|object} zoneId Zone ID (can be a temporal ID)
 * @returns {boolean} Whether the name of this shipping zone can be changed by the user
 */
export const canChangeShippingZoneTitle = isEditableShippingZone;

/**
 * @param {number|object} zoneId Zone ID (can be a temporal ID)
 * @returns {boolean} Whether this shipping zone can be deleted
 */
export const canRemoveShippingZone = isEditableShippingZone;

/**
 * @param {number|object} zoneId Zone ID (can be a temporal ID)
 * @returns {boolean} Whether the locations this zone represents can be altered.
 */
export const canEditShippingZoneLocations = isEditableShippingZone;
