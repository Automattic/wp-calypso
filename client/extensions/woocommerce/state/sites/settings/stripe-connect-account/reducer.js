/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
} from 'woocommerce/state/action-types';

/**
 * Updates state to clear any error from a previous action
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountClearError( state = {} ) {
	return Object.assign( {}, state, {
		error: '',
	} );
}

/**
 * Updates state to indicate account creation is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountCreate( state = {} ) {
	return Object.assign( {}, state, {
		error: '',
		isCreating: true,
	} );
}

/**
 * Updates state to reflect account creation completed (or failed with an error)
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountCreateComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: action.connectedUserID || '',
		displayName: '',
		email: action.email || '',
		error: action.error || '',
		firstName: '',
		isActivated: false,
		isCreating: false,
		isRequesting: false,
		lastName: '',
		logo: '',
	} );
}

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
		error: '',
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

/**
 * Updates state to indicate oauth initialization request is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountOAuthInit( state = {} ) {
	return Object.assign( {}, state, {
		isOAuthInitializing: true,
		oauthUrl: '',
	} );
}

/**
 * Updates state after oauth initialization completes
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountOAuthInitComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		isOAuthInitializing: false,
		error: action.error || '',
		oauthUrl: action.oauthUrl || '',
	} );
}

/**
 * Updates state to indicate account creation is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountOAuthConnect( state = {} ) {
	return Object.assign( {}, state, {
		error: '',
		isOAuthConnecting: true,
	} );
}

/**
 * Updates state to reflect account creation completed (or failed with an error)
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountOAuthConnectComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: action.connectedUserID || '',
		email: '',
		error: action.error || '',
		firstName: '',
		isActivated: false,
		isCreating: false,
		isOAuthConnecting: false,
		isRequesting: false,
		lastName: '',
		logo: '',
	} );
}

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR ]: connectAccountClearError,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE ]: connectAccountCreate,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE ]: connectAccountCreateComplete,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE ]: connectAccountDeauthorize,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE ]: connectAccountDeauthorizeComplete,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST ]: connectAccountFetch,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE ]: connectAccountFetchComplete,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT ]: connectAccountOAuthInit,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE ]: connectAccountOAuthInitComplete,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT ]: connectAccountOAuthConnect,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE ]: connectAccountOAuthConnectComplete,
} );
