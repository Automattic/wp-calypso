/**
 * External dependencies
 */
import { isEqual, unionWith, differenceWith, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
} from '../../../action-types';

const LOCATION_TYPES = [ 'postcode', 'state', 'country', 'continent' ];

// TODO: reorder zones (do we need it for MVP?)

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

export default createReducer( {}, reducers );
