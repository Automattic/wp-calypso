/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { JP_TEST_URL_CHECK_SEND, JP_TEST_URL_CHECK_RECIEVE, JP_TEST_START_OVER } from './actions';

export const requesting = ( state = false, action ) =>
	action.type === JP_TEST_URL_CHECK_SEND
		? true
		: action.type === JP_TEST_URL_CHECK_RECIEVE
			? false
			: action.type === JP_TEST_START_OVER
				? false
				: state;

export const detectedService = ( state = null, action ) =>
	action.type === JP_TEST_URL_CHECK_SEND
		? null
		: action.type === JP_TEST_URL_CHECK_RECIEVE
			? action.service
			: action.type === JP_TEST_START_OVER
				? null
				: state;

export default combineReducers( {
	requesting,
	detectedService,
} );
