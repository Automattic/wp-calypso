/**
 * External dependencies
 */

import { stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST,
	JETPACK_DISCONNECT_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection updates
 *
 * @param  {Array}  state  Current state
 * @param  {object} action action
 * @returns {Array}         Updated state
 */
export const items = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_CONNECTION_STATUS_RECEIVE: {
				const { status } = action;
				return status;
			}
		}

		return state;
	} )
);

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 *
 * @param {object} state - current state
 * @param {object} action - action
 * @returns {object} updated state
 */
export const requests = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_CONNECTION_STATUS_REQUEST:
				return stubTrue( state, action );
			case JETPACK_CONNECTION_STATUS_REQUEST_FAILURE:
				return stubFalse( state, action );
			case JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS:
				return stubFalse( state, action );
		}

		return state;
	} )
);

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack user connection data
 *
 * @param  {Array}  state  Current state
 * @param  {object} action action
 * @returns {Array}         Updated state
 */
export const dataItems = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_USER_CONNECTION_DATA_RECEIVE: {
				const { data } = action;
				return data;
			}
		}

		return state;
	} )
);

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack user connection data requests
 *
 * @param {object} state - current state
 * @param {object} action - action
 * @returns {object} updated state
 */
export const dataRequests = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_USER_CONNECTION_DATA_REQUEST:
				return stubTrue( state, action );
			case JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE:
				return stubFalse( state, action );
			case JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS:
				return stubFalse( state, action );
		}

		return state;
	} )
);

export const disconnectRequests = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_DISCONNECT_REQUEST:
				return stubTrue( state, action );
			case JETPACK_DISCONNECT_REQUEST_FAILURE:
				return stubFalse( state, action );
			case JETPACK_DISCONNECT_REQUEST_SUCCESS:
				return stubFalse( state, action );
		}

		return state;
	} )
);

export const reducer = combineReducers( {
	items,
	requests,
	dataItems,
	dataRequests,
	disconnectRequests,
} );
