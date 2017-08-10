/** @format */
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
} from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_CONNECTION_STATUS_RECEIVE ]: ( state, { status } ) => status,
		}
	)
);

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_CONNECTION_STATUS_REQUEST ]: stubTrue,
			[ JETPACK_CONNECTION_STATUS_REQUEST_FAILURE ]: stubFalse,
			[ JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS ]: stubFalse,
		}
	)
);

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack user connection data
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const dataItems = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_USER_CONNECTION_DATA_RECEIVE ]: ( state, { data } ) => data,
		}
	)
);

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack user connection data requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const dataRequests = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_USER_CONNECTION_DATA_REQUEST ]: stubTrue,
			[ JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE ]: stubFalse,
			[ JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS ]: stubFalse,
		}
	)
);

export const disconnectRequests = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_DISCONNECT_REQUEST ]: stubTrue,
			[ JETPACK_DISCONNECT_REQUEST_FAILURE ]: stubFalse,
			[ JETPACK_DISCONNECT_REQUEST_SUCCESS ]: stubFalse,
		}
	)
);

export const reducer = combineReducers( {
	items,
	requests,
	dataItems,
	dataRequests,
	disconnectRequests,
} );
