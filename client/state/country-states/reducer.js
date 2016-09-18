/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
} from 'state/action-types';
import { createReducer } from 'state/utils';

// Stores the complete list of states
export const countryStatesList = createReducer( {}, {
	[ COUNTRY_STATES_RECEIVE ]: ( state, action ) => {
		return { ...state, [ action.country ]: action.statesList };
	}
} );

// Tracks states list fetching state
export const isFetching = createReducer( false, {
	[ COUNTRY_STATES_REQUEST ]: () => true,
	[ COUNTRY_STATES_RECEIVE ]: () => false,
	[ COUNTRY_STATES_REQUEST_FAILURE ]: () => false
} );

export default combineReducers( {
	isFetching,
	countryStatesList,
} );
