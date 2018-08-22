/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { TRANSACTION_CREATE_REQUEST, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';

// Gets set and reset on success / failure
export const isFetching = createReducer(
	false, // Default fetching
	{
		[ TRANSACTION_CREATE_REQUEST ]: () => true,
		[ TRANSACTION_CREATE_SUCCESS ]: () => false, // reset
		[ TRANSACTION_CREATE_FAILURE ]: () => false, // reset
	}
);

// Gets set and stays set
export const request = createReducer(
	null, // Default request
	{
		[ TRANSACTION_CREATE_REQUEST ]: ( state, action ) => action.request,
		[ TRANSACTION_CREATE_SUCCESS ]: ( state, action ) => state, // kept as original action.request
		[ TRANSACTION_CREATE_FAILURE ]: ( state, action ) => state,
	}
);

// Gets set on response
export const response = createReducer(
	null, // Default response
	{
		[ TRANSACTION_CREATE_REQUEST ]: () => null,
		[ TRANSACTION_CREATE_SUCCESS ]: ( state, action ) => action.response,
		[ TRANSACTION_CREATE_FAILURE ]: ( state, action ) => state, // allows both success and failure
	}
);


// Gets set on error
export const error = createReducer(
	null, // Default error
	{
		[ TRANSACTION_CREATE_REQUEST ]: () => null,
		[ TRANSACTION_CREATE_SUCCESS ]: ( state, action ) => state, // allows both success and failure
		[ TRANSACTION_CREATE_FAILURE ]: ( state, action ) => action.error,
	}
);

export default combineReducers( {
	isFetching,
	request,
	response,
	error,
} );
