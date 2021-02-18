/**
 * External dependencies
 */
import { every, isEmpty, isEqual, omit, pick, reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONE_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATED,
} from 'woocommerce/state/action-types';
import { nextBucketIndex, getBucket } from '../../helpers';
import methodsReducer, { initialState as methodsInitialState } from './methods/reducer';
import locationsReducer, { initialState as locationsInitialState } from './locations/reducer';
import { mergeMethodEdits } from './methods/helpers';

export const initialState = {
	creates: [],
	updates: [],
	deletes: [],
	currentlyEditingId: null,
};

function handleZoneAdd( state ) {
	const id = nextBucketIndex( state.creates );
	// The action of "adding" a zone must not alter the edits, since the user can cancel the zone edit later
	return handleZoneOpen( state, { id } );
}

function handleZoneCancel( state ) {
	// "Canceling" editing a zone is equivalent at "closing" it without any changes
	return handleZoneClose( {
		...state,
		currentlyEditingChanges: {},
	} );
}

function handleZoneClose( state ) {
	const { currentlyEditingChanges, currentlyEditingId } = state;
	if ( null === currentlyEditingId ) {
		return state;
	}
	if (
		isEmpty( omit( currentlyEditingChanges, 'methods', 'locations' ) ) &&
		every( currentlyEditingChanges.methods, isEmpty ) &&
		( ! currentlyEditingChanges.locations || currentlyEditingChanges.locations.pristine )
	) {
		// Nothing to save, no need to go through the rest of the algorithm
		return {
			...state,
			currentlyEditingId: null,
		};
	}

	const bucket = getBucket( { id: currentlyEditingId } );
	let found = false;
	const newBucket = state[ bucket ].map( ( zone ) => {
		if ( isEqual( currentlyEditingId, zone.id ) ) {
			found = true;
			// If edits for the zone were already in the expected bucket, just update them
			return {
				...zone,
				...currentlyEditingChanges,
				methods: mergeMethodEdits( zone.methods, currentlyEditingChanges.methods ),
			};
		}
		return zone;
	} );

	if ( ! found ) {
		// If edits for the zone were *not* in the bucket yet, add them
		newBucket.push( { id: currentlyEditingId, ...currentlyEditingChanges } );
	}

	return {
		...state,
		currentlyEditingId: null,
		[ bucket ]: newBucket,
	};
}

function handleZoneEditName( state, { name } ) {
	if ( null === state.currentlyEditingId ) {
		return state;
	}
	return {
		...state,
		currentlyEditingChanges: {
			...state.currentlyEditingChanges,
			name,
		},
	};
}

function handleZoneOpen( state, { id } ) {
	return {
		...state,
		currentlyEditingId: id,
		currentlyEditingChanges: {
			// Always reset the current changes
			methods: methodsInitialState,
			locations: locationsInitialState,
		},
	};
}

function handleZoneRemove( state, { id } ) {
	const newState = {
		...state,
		currentlyEditingId: null,
	};

	const bucket = getBucket( { id } );
	if ( 'updates' === bucket ) {
		// We only need to add it to the list of "zones to delete" if the zone was already present in the server
		newState.deletes = [ ...state.deletes, { id } ];
	}
	// In any case, remove the zone edits from the bucket where they were
	newState[ bucket ] = reject( state[ bucket ], { id } );

	return newState;
}

function handleZoneUpdated( state, { data, originatingAction: { zone } } ) {
	if ( zone.id !== state.currentlyEditingId ) {
		return state;
	}

	return {
		...state,
		currentlyEditingId: data.id,
		currentlyEditingChanges: pick( state.currentlyEditingChanges, 'locations', 'methods' ),
	};
}

function handleZoneDeleted( state, { originatingAction: { zone } } ) {
	if ( zone.id !== state.currentlyEditingId ) {
		return state;
	}

	return {
		...state,
		currentlyEditingId: null,
	};
}

function handleZoneLocationsUpdated( state, { originatingAction: { zoneId } } ) {
	if ( zoneId !== state.currentlyEditingId ) {
		return state;
	}

	return {
		...state,
		currentlyEditingChanges: {
			...state.currentlyEditingChanges,
			locations: locationsInitialState,
		},
	};
}

export default ( state = initialState, action ) => {
	let newState = state;
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_ADD:
			newState = handleZoneAdd( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_CANCEL:
			newState = handleZoneCancel( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_CLOSE:
			newState = handleZoneClose( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME:
			newState = handleZoneEditName( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_OPEN:
			newState = handleZoneOpen( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_REMOVE:
			newState = handleZoneRemove( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_UPDATED:
			newState = handleZoneUpdated( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_DELETED:
			newState = handleZoneDeleted( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED:
			newState = handleZoneLocationsUpdated( state, action );
			break;
	}

	if ( null !== newState.currentlyEditingId ) {
		const methodsState = newState.currentlyEditingChanges.methods;
		const newMethodsState = methodsReducer( methodsState, action );
		const locationsState = newState.currentlyEditingChanges.locations;
		const newLocationsState = locationsReducer( locationsState, action );
		return {
			...newState,
			currentlyEditingChanges: {
				...newState.currentlyEditingChanges,
				methods: newMethodsState,
				locations: newLocationsState,
			},
		};
	}

	return newState;
};
