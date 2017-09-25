/**
 * External dependencies
 */
import { find, pull } from 'lodash';

/**
 * Internal dependencies
 */
import { mergeLocationEdits } from './helpers';
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CANCEL, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CLOSE, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_CONTINENT, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_COUNTRY, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_STATE, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT_POSTCODE, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_WHOLE_COUNTRY, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_STATE, WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_POSTCODE } from 'woocommerce/state/action-types';

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

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT ] = ( state ) => {
	return { ...state,
		temporaryChanges: { ...initialState },
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CLOSE ] = ( state ) => {
	const { temporaryChanges, ...committedChanges } = state;
	return mergeLocationEdits( committedChanges, temporaryChanges );
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CANCEL ] = ( state ) => {
	return { ...state,
		temporaryChanges: null,
	};
};

// There's no way to handle continent / country selection state having just the changes, so here we'll just
// "journal" the changes and that will be parsed by the selectors
reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_CONTINENT ] = ( state, { continentCode, selected } ) => {
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			states: null,
			postcode: null,
			journal: [ ...state.temporaryChanges.journal, {
				action: selected ? JOURNAL_ACTIONS.ADD_CONTINENT : JOURNAL_ACTIONS.REMOVE_CONTINENT,
				code: continentCode,
			} ],
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_COUNTRY ] = ( state, { countryCode, selected } ) => {
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			states: null,
			postcode: null,
			journal: [ ...state.temporaryChanges.journal, {
				action: selected ? JOURNAL_ACTIONS.ADD_COUNTRY : JOURNAL_ACTIONS.REMOVE_COUNTRY,
				code: countryCode,
			} ],
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_STATE ] = ( state, { stateCode, selected } ) => {
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
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			states: { add, remove, removeAll },
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT_POSTCODE ] = ( state, { postcode } ) => {
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			postcode,
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_WHOLE_COUNTRY ] = ( state ) => {
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			postcode: null,
			states: null,
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_STATE ] = ( state ) => {
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			postcode: null,
			states: {
				add: [],
				remove: [],
				removeAll: true,
			},
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_POSTCODE ] = ( state ) => {
	return { ...state,
		temporaryChanges: { ...state.temporaryChanges,
			postcode: '',
			states: null,
		},
	};
};

const mainReducer = createReducer( initialState, reducer );

export default ( state, action ) => {
	const newState = mainReducer( state, action );

	if ( state.temporaryChanges && newState.temporaryChanges && state.temporaryChanges !== newState.temporaryChanges ) {
		newState.temporaryChanges.pristine = false;
	}

	return newState;
};
