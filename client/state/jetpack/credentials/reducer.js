/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_RECEIVE,
	JETPACK_CREDENTIALS_REQUEST,
	JETPACK_CREDENTIALS_REQUEST_FAILURE,
	JETPACK_CREDENTIALS_REQUEST_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

const createRequestsReducer = ( data ) => {
	return ( state, { siteId } ) => {
		return Object.assign( {}, state, {
			[ siteId ]: data
		} );
	};
};

const createInitialItemsReducer = () => {
	return ( state, { siteId, credentials } ) => {
		return merge( {}, state, {
			[ siteId ]: credentials
		} );
	};
};

const createUpdatedItemsReducer = () => {
	return ( state, { siteId, credentials } ) => {
		const keyedCredentials = {};
		keyedCredentials[ credentials.role ] = credentials;

		return merge( {}, state, {
			[ siteId ]: keyedCredentials
		} );
	};
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack credentials updates
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_CREDENTIALS_RECEIVE ]: createInitialItemsReducer(),
	[ JETPACK_CREDENTIALS_UPDATE_SUCCESS ]: createUpdatedItemsReducer(),
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack credentials related requests
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requests = createReducer( {}, {
	[ JETPACK_CREDENTIALS_REQUEST ]: createRequestsReducer( { requesting: true } ),
	[ JETPACK_CREDENTIALS_REQUEST_FAILURE ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_CREDENTIALS_REQUEST_SUCCESS ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_CREDENTIALS_UPDATE ]: createRequestsReducer( { updating: true } ),
	[ JETPACK_CREDENTIALS_UPDATE_FAILURE ]: createRequestsReducer( { updating: false } ),
	[ JETPACK_CREDENTIALS_UPDATE_SUCCESS ]: createRequestsReducer( { updating: false } ),
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack credentials save requests
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const saveRequests = createReducer( {}, {
	[ JETPACK_CREDENTIALS_UPDATE ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: { saving: true, status: 'pending', error: false }
	} ),
	[ JETPACK_CREDENTIALS_UPDATE_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: { saving: false, status: 'success', error: false }
	} ),
	[ JETPACK_CREDENTIALS_UPDATE_FAILURE ]: ( state, { siteId, error } ) => ( {
		...state,
		[ siteId ]: { saving: false, status: 'error', error }
	} )
} );

export const reducer = combineReducers( {
	items,
	requests,
	saveRequests
} );
