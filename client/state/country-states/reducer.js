/**
 * Internal dependencies
 */
import { itemSchema } from './schema';
import { COUNTRY_STATES_RECEIVE, COUNTRY_STATES_REQUEST, COUNTRY_STATES_REQUEST_FAILURE, COUNTRY_STATES_REQUEST_SUCCESS } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

// Stores the complete list of states, indexed by locale key
export const items = createReducer( {}, {
	[ COUNTRY_STATES_RECEIVE ]: ( state, action ) => ( { ...state, [ action.countryCode ]: action.countryStates } ),
}, itemSchema );

// Tracks states list fetching state
export const isFetching = createReducer( {}, {
	[ COUNTRY_STATES_REQUEST ]: ( state, { countryCode } ) => ( { ...state, [ countryCode ]: true } ),
	[ COUNTRY_STATES_REQUEST_SUCCESS ]: ( state, { countryCode } ) => ( { ...state, [ countryCode ]: false } ),
	[ COUNTRY_STATES_REQUEST_FAILURE ]: ( state, { countryCode } ) => ( { ...state, [ countryCode ]: false } )
} );

export default combineReducers( {
	isFetching,
	items,
} );
