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
import { gsuiteUsersScheama } from './schema';

export const gsuiteUsersReducer = createReducer(
	null,
	{
		[ GSUITE_USERS_REQUEST ]: () => null,
		[ GSUITE_USERS_REQUEST_FAILURE ]: () => null,
		[ GSUITE_USERS_REQUEST_SUCCESS ]: ( state, { response: { accounts } } ) => accounts,
	},
	gsuiteUsersScheama
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
		gsuiteUsers: gsuiteUsersReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
	} )
);
