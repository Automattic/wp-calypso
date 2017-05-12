/**
 * External dependencies
 */
import { isEqual, unionWith, differenceWith, isEmpty, pick, findIndex, isArray, every, mapValues, remove, sortBy, find } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_ADD_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_ADD_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_DELETE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_DELETE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS,
} from '../../../action-types';

const LOCATION_TYPES = [ 'postcode', 'state', 'country', 'continent' ];

// TODO: reorder zones (do we need it for MVP?)

/**
 * Checks if all the zones, shipping methods and zone locations have finished loading from the API.
 * "Finished loading" means that they completed successfully *or* some of them failed, but none are in progress.
 * If all the zones have finished loading, then they are copied into the "zones" key, which
 * is the one that will be modified by UI interactions.
 * @param {Object} state Current state
 * @returns {Object} Updated state (mutated)
 */
const updateZonesIfAllLoaded = ( state ) => {
	if ( state.methodDefinitions &&
		( ! isArray( state.serverZones ) || ( every( state.serverZones, 'locations' ) && every( state.serverZones, 'methods' ) ) ) ) {
		state.zones = state.serverZones;
	}
	return state;
};

const reducers = {};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_ADD ] = ( state ) => {
	return { ...state,
		currentlyEditingZone: {
			id: null,
			locations: [],
			methods: [],
			order: ( ( state.zones[ state.zones.length - 2 ] || {} ).order || 0 ) + 1,
		},
		currentlyEditingZoneIndex: -1,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_EDIT ] = ( state, { index } ) => {
	return { ...state,
		currentlyEditingZone: state.zones[ index ],
		currentlyEditingZoneIndex: index,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_REMOVE ] = ( state, { index } ) => {
	// Protect { id: 0 } (Rest of the World) from deletion
	if ( 0 === state.zones[ index ].id ) {
		return state;
	}
	return { ...state,
		currentlyEditingZone: null,
		zones: [ ...state.zones.slice( 0, index ), ...state.zones.slice( index + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_CANCEL ] = ( state ) => {
	return { ...state,
		currentlyEditingZone: null,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_CLOSE ] = ( state ) => {
	if ( ! state.currentlyEditingZone ) {
		return state;
	}
	const zones = [ ...state.zones ];
	if ( -1 === state.currentlyEditingZoneIndex ) {
		// Keep "Rest Of The World" last always
		zones.splice( zones.length - 1, 0, state.currentlyEditingZone );
	} else {
		zones[ state.currentlyEditingZoneIndex ] = state.currentlyEditingZone;
	}
	return { ...state,
		zones,
		currentlyEditingZone: null,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD ] = ( state, { locationType, locationCode } ) => {
	// TODO: ZIP codes
	// TODO: Get the list of continents / countries / states from somewhere (new endpoint?)
	if ( ! state.currentlyEditingZone ||
		0 === state.currentlyEditingZone.id ||
		! LOCATION_TYPES.includes( locationType ) ) {
		return state;
	}
	const location = { type: locationType, code: locationCode };
	const newLocations = unionWith( state.currentlyEditingZone.locations, [ location ], isEqual );
	return { ...state,
		currentlyEditingZone: { ...state.currentlyEditingZone,
			locations: newLocations,
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE ] = ( state, { locationType, locationCode } ) => {
	// TODO: when removing a country, remove all its states?
	if ( ! state.currentlyEditingZone || ! LOCATION_TYPES.includes( locationType ) ) {
		return state;
	}
	const location = { type: locationType, code: locationCode };
	const newLocations = differenceWith( state.currentlyEditingZone.locations, [ location ], isEqual );
	return { ...state,
		currentlyEditingZone: { ...state.currentlyEditingZone,
			locations: newLocations,
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD ] = ( state ) => {
	if ( isEmpty( state.methodDefinitions ) || ! state.currentlyEditingZone ) {
		return state;
	}
	const currentMethods = state.currentlyEditingZone.methods;
	const methodDefinition = {
		method_id: state.methodDefinitions[ 0 ].id,
		id: null,
		order: ( ( currentMethods[ currentMethods.length - 1 ] || {} ).order || 0 ) + 1,
	};
	return { ...state,
		currentlyEditingZone: { ...state.currentlyEditingZone,
			methods: [ ...currentMethods, methodDefinition ],
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE ] = ( state, { index, newType } ) => {
	if ( ! state.currentlyEditingZone ) {
		return state;
	}
	const { methods } = state.currentlyEditingZone;
	if ( methods[ index ].method_id === newType ) {
		return state;
	}
	const newMethodDefinition = {
		method_id: newType,
		id: null,
		order: methods[ index ].order,
	};
	return { ...state,
		currentlyEditingZone: { ...state.currentlyEditingZone,
			methods: [ ...methods.slice( 0, index ), newMethodDefinition, ...methods.slice( index + 1 ) ],
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT ] = ( state, { index, field, value } ) => {
	if ( ! state.currentlyEditingZone ) {
		return state;
	}
	const { methods } = state.currentlyEditingZone;
	const method = methods[ index ];
	const newMethodDefinition = { ...method,
		[ field ]: value,
	};
	return { ...state,
		currentlyEditingZone: { ...state.currentlyEditingZone,
			methods: [ ...methods.slice( 0, index ), newMethodDefinition, ...methods.slice( index + 1 ) ],
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ] = ( state, { index } ) => {
	if ( ! state.currentlyEditingZone ) {
		return state;
	}
	const { methods } = state.currentlyEditingZone;
	return { ...state,
		currentlyEditingZone: { ...state.currentlyEditingZone,
			methods: [ ...methods.slice( 0, index ), ...methods.slice( index + 1 ) ],
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR ] = ( state, { error } ) => {
	return updateZonesIfAllLoaded( { ...state,
		methodDefinitions: { error },
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS ] = ( state, { methods } ) => {
	return updateZonesIfAllLoaded( { ...state,
		methodDefinitions: methods,
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR ] = ( state, { id, error } ) => {
	const { serverZones } = state;
	const index = findIndex( serverZones, { id } );
	if ( -1 === index ) {
		return state;
	}
	const zone = { ...serverZones[ index ],
		locations: { error },
	};
	return updateZonesIfAllLoaded( { ...state,
		serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS ] = ( state, { id, locations } ) => {
	const { serverZones } = state;
	const index = findIndex( serverZones, { id } );
	if ( -1 === index ) {
		return state;
	}
	const zone = { ...serverZones[ index ],
		locations,
	};
	return updateZonesIfAllLoaded( { ...state,
		serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR ] = ( state, { id, error } ) => {
	const { serverZones } = state;
	const index = findIndex( serverZones, { id } );
	if ( -1 === index ) {
		return state;
	}
	const zone = { ...serverZones[ index ],
		methods: { error },
	};
	return updateZonesIfAllLoaded( { ...state,
		serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
	} );
};

const parseShippingMethod = ( methodDefinition ) => ( {
	...pick( methodDefinition, [ 'enabled', 'method_id', 'order' ] ),
	id: methodDefinition.instance_id,
	...mapValues( methodDefinition.settings, 'value' ),
} );

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS ] = ( state, { id, methods } ) => {
	// TODO: How to handle unsupported methods?
	methods = sortBy( methods, 'order' );
	const { serverZones } = state;
	const index = findIndex( serverZones, { id } );
	if ( -1 === index ) {
		return state;
	}
	const zone = { ...serverZones[ index ],
		methods: methods.map( parseShippingMethod ),
	};
	return updateZonesIfAllLoaded( { ...state,
		serverZones: [ ...serverZones.slice( 0, index ), zone, ...serverZones.slice( index + 1 ) ],
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR ] = ( state, { error } ) => {
	return updateZonesIfAllLoaded( { ...state,
		serverZones: { error },
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS ] = ( state, { zones } ) => {
	zones = { ...zones };
	const restOfWorldZone = remove( zones, { id: 0 } )[ 0 ];
	if ( ! restOfWorldZone ) {
		throw new Error( 'The server didn\'t provide a "Rest Of The World" shipping zone' );
	}
	return updateZonesIfAllLoaded( { ...state,
		serverZones: [ ...sortBy( zones, 'order' ), restOfWorldZone ],
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_ADD_SUCCESS ] = ( state, { zone } ) => {
	const { zones } = state;
	const serverZones = [ ...state.serverZones ];
	const restOfWorldServerZone = remove( serverZones, { id: 0 } )[ 0 ];
	const index = findIndex( zones, { order: zone.order } );
	if ( -1 === index || ! restOfWorldServerZone ) {
		return state;
	}
	return { ...state,
		serverZones: [ ...sortBy( [ ...serverZones, zone ], 'order' ), restOfWorldServerZone ],
		zones: [ ...zones.slice( 0, index ), zone, ...zones.slice( index + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_ADD_ERROR ] = ( state, { error, order, zoneId } ) => {
	const { zones } = state;
	let index = findIndex( zones, { id: zoneId } );
	if ( -1 === index ) {
		index = findIndex( zones, { order } );
	}
	if ( -1 === index ) {
		return state;
	}
	const zone = { ...zones[ index ],
		error,
	};
	return { ...state,
		zones: [ ...zones.slice( 0, index ), zone, ...zones.slice( index + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_UPDATE_SUCCESS ] = ( state, { zone } ) => {
	const { zones } = state;
	const serverZones = [ ...state.serverZones ];
	const restOfWorldServerZone = remove( serverZones, { id: 0 } )[ 0 ];
	const index = findIndex( zones, { id: zone.id } );
	const serverIndex = findIndex( serverZones, { id: zone.id } );
	if ( -1 === index || -1 === serverIndex || ! restOfWorldServerZone ) {
		return state;
	}
	serverZones[ serverIndex ] = zone;
	return { ...state,
		serverZones: [ ...sortBy( serverZones, 'order' ), restOfWorldServerZone ],
		zones: [ ...zones.slice( 0, index ), zone, ...zones.slice( index + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_UPDATE_ERROR ] = reducers[ WOOCOMMERCE_SHIPPING_ZONE_ADD_ERROR ];

reducers[ WOOCOMMERCE_SHIPPING_ZONE_DELETE_SUCCESS ] = ( state, { zone } ) => {
	const serverZones = [ ...state.serverZones ];
	const serverIndex = findIndex( serverZones, { id: zone.id } );
	if ( -1 === serverIndex ) {
		return state;
	}
	serverZones.splice( serverIndex, 1 );
	return { ...state,
		serverZones,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_DELETE_ERROR ] = ( state, { error, zoneId } ) => {
	const { serverZones } = state;
	const zones = [ ...state.zones ];
	const serverZone = find( serverZones, { id: zoneId } );
	const restOfWorldZone = remove( zones, { id: 0 } )[ 0 ];
	if ( ! serverZone || ! restOfWorldZone ) {
		return state;
	}
	const zone = { ...serverZone,
		error,
		markedToDelete: true,
	};
	return { ...state,
		zones: [ ...sortBy( [ ...zones, zone ], 'order' ), restOfWorldZone ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_SUCCESS ] = ( state, { zoneId, locations } ) => {
	const { zones, serverZones } = state;
	const index = findIndex( zones, { id: zoneId } );
	const serverIndex = findIndex( serverZones, { id: zoneId } );
	if ( -1 === index || -1 === serverIndex ) {
		return state;
	}
	const zone = { ...zones[ index ],
		locations,
	};
	const serverZone = { ...serverZones[ serverIndex ],
		locations,
	};
	return { ...state,
		serverZones: [ ...serverZones.slice( 0, serverIndex ), serverZone, ...serverZones.slice( serverIndex + 1 ) ],
		zones: [ ...zones.slice( 0, index ), zone, ...zones.slice( index + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_ERROR ] = ( state, { zoneId, error } ) => {
	const { zones } = state;
	const index = findIndex( zones, { id: zoneId } );
	if ( -1 === index ) {
		return state;
	}
	const zone = { ...zones[ index ],
		locationsError: error,
	};
	return { ...state,
		zones: [ ...zones.slice( 0, index ), zone, ...zones.slice( index + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_SUCCESS ] = ( state, { zoneId, order, method } ) => {
	const { zones, serverZones } = state;
	const zoneIndex = findIndex( zones, { id: zoneId } );
	const serverZoneIndex = findIndex( serverZones, { id: zoneId } );
	if ( -1 === zoneIndex || -1 === serverZoneIndex ) {
		return state;
	}
	const methodIndex = findIndex( zones[ zoneIndex ].methods, { order } );
	if ( -1 === methodIndex ) {
		return state;
	}
	const methods = [ ...zones[ zoneIndex ].methods ];
	methods[ methodIndex ] = parseShippingMethod( method );
	const zone = { ...zones[ zoneIndex ],
		methods,
	};
	const serverZone = { ...serverZones[ serverZoneIndex ],
		methods: sortBy( [ ...serverZones[ serverZoneIndex ].methods, parseShippingMethod( method ) ], 'order' ),
	};
	return { ...state,
		serverZones: [ ...serverZones.slice( 0, serverZoneIndex ), serverZone, ...serverZones.slice( serverZoneIndex + 1 ) ],
		zones: [ ...zones.slice( 0, zoneIndex ), zone, ...zones.slice( zoneIndex + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_ERROR ] = ( state, { zoneId, order, id, error } ) => {
	const { zones } = state;
	const zoneIndex = findIndex( zones, { id: zoneId } );
	if ( -1 === zoneIndex ) {
		return state;
	}
	let methodIndex = findIndex( zones[ zoneIndex ].methods, { id } );
	if ( -1 === methodIndex ) {
		methodIndex = findIndex( zones[ zoneIndex ].methods, { order } );
	}
	if ( -1 === methodIndex ) {
		return state;
	}
	const methods = [ ...zones[ zoneIndex ].methods ];
	methods[ methodIndex ] = { ...methods[ methodIndex ],
		error,
	};
	const zone = { ...zones[ zoneIndex ],
		methods,
	};
	return { ...state,
		zones: [ ...zones.slice( 0, zoneIndex ), zone, ...zones.slice( zoneIndex + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_SUCCESS ] = ( state, { zoneId, method } ) => {
	method = parseShippingMethod( method );
	const { zones, serverZones } = state;
	const zoneIndex = findIndex( zones, { id: zoneId } );
	const serverZoneIndex = findIndex( serverZones, { id: zoneId } );
	if ( -1 === zoneIndex || -1 === serverZoneIndex ) {
		return state;
	}
	const methodIndex = findIndex( zones[ zoneIndex ].methods, { id: method.id } );
	const serverMethodIndex = findIndex( serverZones[ serverZoneIndex ].methods, { id: method.id } );
	if ( -1 === methodIndex || -1 === serverMethodIndex ) {
		return state;
	}
	const methods = [ ...zones[ zoneIndex ].methods ];
	methods[ methodIndex ] = method;
	const zone = { ...zones[ zoneIndex ],
		methods,
	};
	const serverMethods = [ ...serverZones[ serverZoneIndex ].methods ];
	serverMethods.splice( serverMethodIndex, 1 );
	const serverZone = { ...serverZones[ serverZoneIndex ],
		methods: sortBy( [ ...serverMethods, method ], 'order' ),
	};
	return { ...state,
		serverZones: [ ...serverZones.slice( 0, serverZoneIndex ), serverZone, ...serverZones.slice( serverZoneIndex + 1 ) ],
		zones: [ ...zones.slice( 0, zoneIndex ), zone, ...zones.slice( zoneIndex + 1 ) ],
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_ERROR ] = reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_ERROR ];

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_SUCCESS ] = ( state, { zoneId, method } ) => {
	method = parseShippingMethod( method );
	const serverZones = [ ...state.serverZones ];
	const serverZoneIndex = findIndex( serverZones, { id: zoneId } );
	if ( -1 === serverZoneIndex ) {
		return state;
	}
	const serverMethods = [ ...serverZones[ serverZoneIndex ].methods ];
	const serverMethodIndex = findIndex( serverMethods, { id: method.id } );
	if ( -1 === serverMethodIndex ) {
		return state;
	}
	serverMethods.splice( serverMethodIndex, 1 );
	return { ...state,
		serverZones,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_ERROR ] = ( state, { zoneId, error, id } ) => {
	const { serverZones } = state;
	const zones = [ ...state.zones ];
	const zoneIndex = findIndex( zones, { id: zoneId } );
	const serverZone = find( serverZones, { id: zoneId } );
	if ( ! serverZone || -1 === zoneIndex ) {
		return state;
	}
	const serverMethod = find( serverZone.methods, { id } );
	if ( ! serverMethod ) {
		return state;
	}
	const method = { ...serverMethod,
		error,
		markedToDelete: true,
	};
	const zone = { ...zones[ zoneIndex ],
		methods: sortBy( [ ...zones[ zoneIndex ].methods, method ], 'order' ),
	};
	return { ...state,
		zones: [ ...zones.slice( 0, zoneIndex ), zone, ...zones.slice( zoneIndex + 1 ) ],
	};
};

export default createReducer( {}, reducers );
