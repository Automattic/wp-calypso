/** @format */

/**
 * External dependencies
 */

import {
	find,
	intersection,
	isEmpty,
	isNumber,
	isNil,
	map,
	merge,
	pullAll,
	startsWith,
} from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getAPIShippingZones,
	areShippingZonesLoaded,
} from 'woocommerce/state/sites/shipping-zones/selectors';
import { getShippingMethods } from 'woocommerce/state/sites/shipping-methods/selectors';
import { getShippingZoneMethod } from 'woocommerce/state/sites/shipping-zone-methods/selectors';
import { getShippingZonesEdits, getCurrentlyEditingShippingZone } from '../selectors';
import { getBucket } from 'woocommerce/state/ui/helpers';
import { builtInShippingMethods } from 'woocommerce/state/ui/shipping/zones/methods/reducer';
import { mergeMethodEdits } from './helpers';
import { getShippingMethodSchema } from 'woocommerce/woocommerce-services/state/shipping-method-schemas/selectors';
import getDefaultSettingsValues from 'woocommerce/woocommerce-services/lib/get-default-settings-values';

const getShippingZone = createSelector(
	( state, zoneId, siteId ) => {
		if ( ! areShippingZonesLoaded( state, siteId ) ) {
			return null;
		}
		if ( null === zoneId ) {
			return getCurrentlyEditingShippingZone( state, siteId );
		}
		return find( getAPIShippingZones( state, siteId ), { id: zoneId } );
	},
	( state, zoneId, siteId ) => {
		const loaded = areShippingZonesLoaded( state, siteId );
		return [
			loaded,
			loaded && getCurrentlyEditingShippingZone( state, siteId ),
			loaded && getAPIShippingZones( state, siteId ),
		];
	},
	( state, zoneId, siteId ) => {
		if ( ! isNumber( zoneId ) ) {
			return `i${ zoneId.index }${ siteId }`;
		}

		return `${ zoneId }${ siteId }`;
	}
);

const getShippingZoneMethodsEdits = ( state, zoneId, siteId ) => {
	const zonesEdits = getShippingZonesEdits( state, siteId );
	if ( zonesEdits ) {
		const zoneEdits = find( zonesEdits[ getBucket( { id: zoneId } ) ], { id: zoneId } );
		if ( zoneEdits && ! isEmpty( zoneEdits.methods ) ) {
			return zoneEdits.methods;
		}
	}
	return {
		creates: [],
		updates: [],
		deletes: [],
		currentlyEditingId: null,
	};
};

const sortShippingZoneMethods = ( state, siteId, methods ) => {
	return methods.sort( ( a, b ) => {
		const aId = isNil( a._originalId ) ? a.id : a._originalId;
		const bId = isNil( b._originalId ) ? b.id : b._originalId;

		if ( isNumber( aId ) ) {
			// Both IDs are numbers (come from the server), so compare their "order" property
			if ( isNumber( bId ) ) {
				return (
					getShippingZoneMethod( state, aId, siteId ).order -
					getShippingZoneMethod( state, bId, siteId ).order
				);
			}
			// "a" is a pre-existing method (numeric ID) so it comes first than the newly created (object ID) "b"
			return -1;
		}

		if ( isNumber( bId ) ) {
			// "b" is a pre-existing method (numeric ID) so it comes first than the newly created (object ID) "a"
			return 1;
		}
		// Both IDs are "Object IDs", just compare their indices
		return aId.index - bId.index;
	} );
};

const overlayShippingZoneMethods = ( state, zone, siteId, extraEdits ) => {
	const methodIds = [ ...( zone.methodIds || [] ) ];
	const edits = getShippingZoneMethodsEdits( state, zone.id, siteId );
	const { creates, updates, deletes } = mergeMethodEdits( edits, extraEdits );

	// Overlay the current edits on top of (a copy of) the wc-api zone methods
	pullAll( methodIds, map( deletes, 'id' ) );
	const methods = methodIds.map( methodId => getShippingZoneMethod( state, methodId, siteId ) );
	updates.forEach( update => {
		const index = methodIds.indexOf( update.id );
		if ( -1 === index ) {
			return;
		}
		methods[ index ] = { ...methods[ index ], ...update };
	} );

	// Compute the "enabled" prop for all the methods. If a method hasn't been explicitly disabled (enabled===false), then it's enabled
	const allMethods = [ ...methods, ...creates ].map( method => {
		let enabled = method.enabled;
		if ( isNil( enabled ) && 'number' === typeof method._originalId ) {
			// If the "enabled" prop hasn't been modified, use the value from the original method
			enabled = getShippingZoneMethod( state, method._originalId, siteId ).enabled;
		}

		const defaultValues = startsWith( method.methodType, 'wc_services' )
			? getDefaultSettingsValues(
					getShippingMethodSchema( state, method.methodType, siteId ).formSchema
			  )
			: {};

		return merge( {}, defaultValues, method, { enabled: false !== enabled } );
	} );
	return sortShippingZoneMethods( state, siteId, allMethods );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [zoneId] Shipping Zone ID
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of shipping methods included in the given shipping zone. On any failure, it will return
 * an empty Array
 */
export const getShippingZoneMethods = createSelector(
	( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingZonesLoaded( state, siteId ) ) {
			return [];
		}
		const zone = getShippingZone( state, zoneId, siteId ) || { id: zoneId, methodIds: [] };

		return overlayShippingZoneMethods( state, zone, siteId );
	},
	( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areShippingZonesLoaded( state, siteId );
		return [
			loaded,
			loaded && getShippingZone( state, siteId ),
			loaded && getShippingZonesEdits( state, siteId ),
		];
	},
	( state, zoneId, siteId ) => {
		if ( ! isNumber( zoneId ) ) {
			return `i${ zoneId.index }${ siteId }`;
		}

		return `${ zoneId }${ siteId }`;
	}
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of shipping methods included in the shipping zone currently being edited, including
 * shipping methods that haven't yet been "committed" to the main state tree. On any failure, it will return
 * an empty Array
 */
export const getCurrentlyEditingShippingZoneMethods = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingZonesLoaded( state, siteId ) ) {
			return [];
		}
		const zone = getCurrentlyEditingShippingZone( state, siteId );
		if ( ! zone ) {
			return [];
		}

		const currentMethodEdits = getShippingZonesEdits( state, siteId ).currentlyEditingChanges
			.methods;
		return overlayShippingZoneMethods( state, zone, siteId, currentMethodEdits );
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areShippingZonesLoaded( state, siteId );
		const zone = loaded && getCurrentlyEditingShippingZone( state, siteId );
		return [ loaded, zone, zone && getShippingZonesEdits( state, siteId ) ];
	}
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object|null} The currently open shipping method or null
 */
export const getCurrentlyOpenShippingZoneMethod = (
	state,
	siteId = getSelectedSiteId( state )
) => {
	if ( ! areShippingZonesLoaded( state, siteId ) ) {
		return null;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	if ( ! zone || ! zone.methods || ! zone.methods.currentlyEditingId ) {
		return null;
	}

	const { methodType } = zone.methods.currentlyEditingChanges;
	const defaultValues = startsWith( methodType, 'wc_services' )
		? getDefaultSettingsValues( getShippingMethodSchema( state, methodType, siteId ).formSchema )
		: {};

	if ( zone.methods.currentlyEditingNew ) {
		return merge( {}, defaultValues, zone.methods.currentlyEditingChanges, {
			enabled: false !== zone.methods.currentlyEditingChanges.enabled,
		} );
	}

	const methods = getCurrentlyEditingShippingZoneMethods( state );
	const openMethod = find( methods, { id: zone.methods.currentlyEditingId } );
	if ( ! openMethod ) {
		return null;
	}

	const enabled = isNil( zone.methods.currentlyEditingChanges.enabled )
		? false !== openMethod.enabled
		: false !== zone.methods.currentlyEditingChanges.enabled;

	return merge( {}, defaultValues, openMethod, zone.methods.currentlyEditingChanges, { enabled } );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the opened method is new or not
 */
export const isCurrentlyOpenShippingZoneMethodNew = (
	state,
	siteId = getSelectedSiteId( state )
) => {
	if ( ! areShippingZonesLoaded( state, siteId ) ) {
		return false;
	}

	const zone = getCurrentlyEditingShippingZone( state, siteId );
	if ( ! zone || ! zone.methods || ! zone.methods.currentlyEditingId ) {
		return false;
	}

	return zone.methods.currentlyEditingNew;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [zoneId] Shipping Zone ID. If not provided, it will default to the shipping zone currently being edited
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of Shipping Method types that can be added to the given shipping Zone
 */
export const getNewMethodTypeOptions = (
	state,
	zoneId = null,
	siteId = getSelectedSiteId( state )
) => {
	const options = [];
	const currentMethods =
		null === zoneId
			? getCurrentlyEditingShippingZoneMethods( state, siteId )
			: getShippingZoneMethods( state, zoneId, siteId );

	const currentMethodTypes = map( currentMethods, 'methodType' );
	const allMethods = intersection(
		Object.keys( builtInShippingMethods ),
		map( getShippingMethods( state, siteId ), 'id' )
	);
	allMethods.forEach( methodType => {
		// A user can add as many "Local Pickup" and Live Rates methods as he wants for a given zone
		if (
			'local_pickup' === methodType ||
			startsWith( methodType, 'wc_services' ) ||
			-1 === currentMethodTypes.indexOf( methodType )
		) {
			options.push( methodType );
		}
	} );

	//if a method is open and its type has been changed, put the original type back on the list
	const openMethod = getCurrentlyOpenShippingZoneMethod( state, siteId );
	if ( openMethod ) {
		const originalMethod = find( currentMethods, { id: openMethod.id } );
		if (
			originalMethod &&
			openMethod.methodType !== originalMethod.methodType &&
			-1 === options.indexOf( originalMethod.methodType )
		) {
			options.push( originalMethod.methodType );
		}
	}

	return options.sort();
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} currentMethodType Shipping method type currently being used
 * @param {Number} [zoneId] Shipping Zone ID. If not provided, it will default to the shipping zone currently being edited
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of Shipping Method types that this shipping zone method can be changed too. It
 * includes the current method type.
 */
export const getMethodTypeChangeOptions = (
	state,
	currentMethodType,
	zoneId = null,
	siteId = getSelectedSiteId( state )
) => {
	const options = getNewMethodTypeOptions( state, zoneId, siteId );
	return -1 === options.indexOf( currentMethodType )
		? [ ...options, currentMethodType ].sort()
		: options;
};
