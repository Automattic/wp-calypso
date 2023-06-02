import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @returns {Array}         Updated state
 */
export const items = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_STATUS_RECEIVE:
			return action.status;
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @returns {Object} updated state
 */
export const requests = keyedReducer( 'siteId', ( state = false, action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_STATUS_REQUEST:
			return true;
		case JETPACK_CONNECTION_STATUS_REQUEST_FAILURE:
		case JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack user connection data
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @returns {Array}         Updated state
 */
export const dataItems = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_USER_CONNECTION_DATA_RECEIVE:
			return action.data;
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack user connection data requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @returns {Object} updated state
 */
export const dataRequests = keyedReducer( 'siteId', ( state = false, action ) => {
	switch ( action.type ) {
		case JETPACK_USER_CONNECTION_DATA_REQUEST:
			return true;
		case JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE:
		case JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

export const reducer = combineReducers( {
	items,
	requests,
	dataItems,
	dataRequests,
} );
