/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'calypso/state/utils';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_COMPLETED_NOTIFICATION,
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
 * @param  {object} state  Current state
 * @returns {object}        Updated state
 */
function connectAccountClearError( state = {} ) {
	return Object.assign( {}, state, {
		error: '',
	} );
}

/**
 * Updates state to clear the completed state from a previous connect or create action
 *
 * @param  {object} state  Current state
 * @returns {object}        Updated state
 */
function connectAccountClearCompletedNotification( state = {} ) {
	return Object.assign( {}, state, {
		notifyCompleted: false,
	} );
}

/**
 * Updates state to indicate account creation is in progress
 *
 * @param  {object} state  Current state
 * @returns {object}        Updated state
 */
function connectAccountCreate( state = {} ) {
	return Object.assign( {}, state, {
		error: '',
		isCreating: true,
		notifyCompleted: false,
	} );
}

/**
 * Updates state to reflect account creation completed (or failed with an error)
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
		notifyCompleted: true,
	} );
}

/**
 * Updates state to indicate account (details) fetch request is in progress
 *
 * @param  {object} state  Current state
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @returns {object}        Updated state
 */
function connectAccountDeauthorize( state = {} ) {
	return Object.assign( {}, state, {
		isDeauthorizing: true,
	} );
}

/**
 * Updates state after deauthorization completes
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @returns {object}        Updated state
 */
function connectAccountOAuthConnect( state = {} ) {
	return Object.assign( {}, state, {
		error: '',
		isOAuthConnecting: true,
		notifyCompleted: false,
	} );
}

/**
 * Updates state to reflect account creation completed (or failed with an error)
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
		notifyCompleted: true,
	} );
}

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_COMPLETED_NOTIFICATION:
			return connectAccountClearCompletedNotification( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR:
			return connectAccountClearError( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE:
			return connectAccountCreate( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE:
			return connectAccountCreateComplete( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE:
			return connectAccountDeauthorize( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE:
			return connectAccountDeauthorizeComplete( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST:
			return connectAccountFetch( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE:
			return connectAccountFetchComplete( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT:
			return connectAccountOAuthInit( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE:
			return connectAccountOAuthInitComplete( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT:
			return connectAccountOAuthConnect( state, action );
		case WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE:
			return connectAccountOAuthConnectComplete( state, action );
	}

	return state;
} );
