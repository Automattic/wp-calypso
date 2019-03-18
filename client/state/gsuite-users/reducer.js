/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	GSUITE_USERS_REQUEST,
	GSUITE_USERS_REQUEST_FAILURE,
	GSUITE_USERS_REQUEST_SUCCESS,
} from 'state/action-types';
import { usersSchema } from './schema';

export const usersReducer = createReducer(
	null,
	{
		[ GSUITE_USERS_REQUEST ]: () => null,
		[ GSUITE_USERS_REQUEST_FAILURE ]: () => null,
		[ GSUITE_USERS_REQUEST_SUCCESS ]: ( state, { response: { accounts } } ) => accounts,
	},
	usersSchema
);

export const requestErrorReducer = createReducer( false, {
	[ GSUITE_USERS_REQUEST ]: () => false,
	[ GSUITE_USERS_REQUEST_FAILURE ]: () => true,
	[ GSUITE_USERS_REQUEST_SUCCESS ]: () => false,
} );

export const requestingReducer = createReducer( false, {
	[ GSUITE_USERS_REQUEST ]: () => true,
	[ GSUITE_USERS_REQUEST_FAILURE ]: () => false,
	[ GSUITE_USERS_REQUEST_SUCCESS ]: () => false,
} );

export default keyedReducer(
	'siteId',
	combineReducers( {
		users: usersReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
	} )
);
