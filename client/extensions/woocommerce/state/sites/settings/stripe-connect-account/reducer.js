/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
} from 'woocommerce/state/action-types';

/**
 * Updates state to indicate account (details) fetch request is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountFetch( state = {} ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		displayName: '',
		email: '',
		firstName: '',
		isActivated: false,
		isDeauthorizing: false,
		isRequesting: true,
		lastName: '',
		logo: '',
	} );
}

/**
 * Updates state with fetched account details
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountFetchComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: action.connectedUserID || '',
		displayName: action.displayName || '',
		email: action.email || '',
		error: action.error || '',
		firstName: action.firstName || '',
		isActivated: action.isActivated || false,
		isDeauthorizing: false,
		isRequesting: false,
		lastName: action.lastName || '',
		logo: action.logo || '',
	} );
}

/**
 * Updates state to indicate account deauthorization request is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountDeauthorize( state = {} ) {
	return Object.assign( {}, state, {
		isDeauthorizing: true,
	} );
}

/**
 * Updates state after deauthorization completes
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountDeauthorizeComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		displayName: '',
		email: '',
		error: action.error || '',
		firstName: '',
		isActivated: false,
		isDeauthorizing: false,
		isRequesting: false,
		lastName: '',
		logo: '',
	} );
}

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE ]: connectAccountDeauthorize,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE ]: connectAccountDeauthorizeComplete,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST ]: connectAccountFetch,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE ]: connectAccountFetchComplete,
} );
