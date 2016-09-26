/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	STATES_LIST_RECEIVE,
	STATES_LIST_REQUEST,
	STATES_LIST_REQUEST_FAILURE,
} from 'state/action-types';
import { statesListSchema } from './schema';
import { createReducer } from 'state/utils';

// Stores the complete list of states, indexed by locale key
export const items = createReducer( {}, {
	[ STATES_LIST_RECEIVE ]: ( state, action ) => ( { ...state, [ action.countryCode ]: action.statesList } ),
}, statesListSchema );

// Tracks states list fetching state
export const isFetching = createReducer( false, {
	[ STATES_LIST_REQUEST ]: ( state, { countryCode } ) => ( { ...state, [ countryCode ]: true } ),
	[ STATES_LIST_RECEIVE ]: ( state, { countryCode } ) => ( { ...state, [ countryCode ]: false } ),
	[ STATES_LIST_REQUEST_FAILURE ]: ( state, { countryCode } ) => ( { ...state, [ countryCode ]: false } )
} );

export default combineReducers( {
	isFetching,
	items,
} );
