/**
 * External dependencies
 */
import { find, pull } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_CONTINENT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_COUNTRY,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_STATE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT_POSTCODE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_WHOLE_COUNTRY,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_STATE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_POSTCODE,
} from 'woocommerce/state/action-types';
import { mergeLocationEdits } from './helpers';

export const JOURNAL_ACTIONS = {
	ADD_CONTINENT: 'ADD_CONTINENT',
	REMOVE_CONTINENT: 'REMOVE_CONTINENT',
	ADD_COUNTRY: 'ADD_COUNTRY',
	REMOVE_COUNTRY: 'REMOVE_COUNTRY',
};

export const initialState = {
	journal: [],
	states: null,
	postcode: null,
	pristine: true,
};

function handleLocationsEdit( state ) {
	return {
		...state,
		temporaryChanges: { ...initialState },
	};
}

function handleLocationsClose( state ) {
	const { temporaryChanges, ...committedChanges } = state;
	return mergeLocationEdits( committedChanges, temporaryChanges );
}

function handleLocationsCancel( state ) {
	return {
		...state,
		temporaryChanges: null,
	};
}

// There's no way to handle continent / country selection state having just the changes, so here we'll just
// "journal" the changes and that will be parsed by the selectors
function handleLocationsSelectContinent( state, { continentCode, selected } ) {
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			states: null,
			postcode: null,
			journal: [
				...state.temporaryChanges.journal,
				{
					action: selected ? JOURNAL_ACTIONS.ADD_CONTINENT : JOURNAL_ACTIONS.REMOVE_CONTINENT,
					code: continentCode,
				},
			],
		},
	};
}

function handleLocationsSelectCountry( state, { countryCode, selected } ) {
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			states: null,
			postcode: null,
			journal: [
				...state.temporaryChanges.journal,
				{
					action: selected ? JOURNAL_ACTIONS.ADD_COUNTRY : JOURNAL_ACTIONS.REMOVE_COUNTRY,
					code: countryCode,
				},
			],
		},
	};
}

function handleLocationsSelectState( state, { stateCode, selected } ) {
	const states = state.temporaryChanges.states || {
		add: [],
		remove: [],
		removeAll: false,
	};
	const add = [ ...states.add ];
	const remove = [ ...states.remove ];
	const removeAll = states.removeAll;

	if ( selected ) {
		if ( ! find( add, stateCode ) ) {
			add.push( stateCode );
		}
		pull( remove, stateCode );
	} else {
		if ( ! find( remove, stateCode ) ) {
			remove.push( stateCode );
		}
		pull( add, stateCode );
	}
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			states: { add, remove, removeAll },
		},
	};
}

function handleLocationsEditPostcode( state, { postcode } ) {
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			postcode,
		},
	};
}

function handleLocationsFilterByWholeCountry( state ) {
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			postcode: null,
			states: null,
		},
	};
}

function handleLocationsFilterByState( state ) {
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			postcode: null,
			states: {
				add: [],
				remove: [],
				removeAll: true,
			},
		},
	};
}

function handleFilterByPostcode( state ) {
	return {
		...state,
		temporaryChanges: {
			...state.temporaryChanges,
			postcode: '',
			states: null,
		},
	};
}

export default ( state = initialState, action ) => {
	let newState = state;
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT:
			newState = handleLocationsEdit( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CLOSE:
			newState = handleLocationsClose( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CANCEL:
			newState = handleLocationsCancel( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_CONTINENT:
			newState = handleLocationsSelectContinent( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_COUNTRY:
			newState = handleLocationsSelectCountry( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_STATE:
			newState = handleLocationsSelectState( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT_POSTCODE:
			newState = handleLocationsEditPostcode( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_WHOLE_COUNTRY:
			newState = handleLocationsFilterByWholeCountry( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_STATE:
			newState = handleLocationsFilterByState( state, action );
			break;

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_POSTCODE:
			newState = handleFilterByPostcode( state, action );
			break;
	}

	if (
		state.temporaryChanges &&
		newState.temporaryChanges &&
		state.temporaryChanges !== newState.temporaryChanges
	) {
		newState.temporaryChanges.pristine = false;
	}

	return newState;
};
