/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
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
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../../request';

/**
 * Action Creator: Clear any error from a previous action.
 *
 * @param {Number} siteId The id of the site for which to clear errors.
 * @return {Object} Action object
 */
export const clearError = siteId => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const clearErrorAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR,
		siteId,
	};

	dispatch( clearErrorAction );
};

/**
 * Action Creator: Create (and connect) a Stripe Connect Account.
 *
 * @param {Number} siteId The id of the site for which to create an account.
 * @param {String} email Email address (i.e. of the logged in WordPress.com user) to pass to Stripe.
 * @param {String} country Two character country code to pass to Stripe (e.g. US).
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export const createAccount = (
	siteId,
	email,
	country,
	successAction = null,
	failureAction = null
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const createAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
		country,
		email,
		siteId,
	};

	dispatch( createAction );

	return request( siteId )
		.post( 'connect/stripe/account', { email, country }, 'wc/v1' )
		.then( data => {
			dispatch( createSuccess( siteId, createAction, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( createFailure( siteId, createAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

function createSuccess( siteId, { email }, { account_id } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		connectedUserID: account_id,
		email,
		siteId,
	};
}

function createFailure( siteId, action, { message } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		error: message,
		siteId,
	};
}

/**
 * Action Creator: Fetch Stripe Connect Account Details.
 *
 * @param {Number} siteId The id of the site for which to fetch connected account details.
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export const fetchAccountDetails = ( siteId, successAction = null, failureAction = null ) => (
	dispatch,
	getState
) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const fetchAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
		siteId,
	};

	dispatch( fetchAction );

	return request( siteId )
		.get( 'connect/stripe/account', 'wc/v1' )
		.then( data => {
			dispatch( fetchSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( fetchFailure( siteId, fetchAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

function fetchSuccess( siteId, data ) {
	const { account_id, display_name, email, business_logo, legal_entity, payouts_enabled } = data;
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
		connectedUserID: account_id,
		displayName: display_name,
		email,
		firstName: legal_entity.first_name,
		isActivated: payouts_enabled,
		logo: business_logo,
		lastName: legal_entity.last_name,
		siteId,
	};
}

function fetchFailure( siteId, action, { message } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
		error: message,
		siteId,
	};
}

/**
 * Action Creator: Disconnect Account.
 *
 * @param {Number} siteId The id of the site to disconnect from Stripe Connect.
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export const deauthorizeAccount = ( siteId, successAction = null, failureAction = null ) => (
	dispatch,
	getState
) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const deauthorizeAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
		siteId,
	};

	dispatch( deauthorizeAction );

	return request( siteId )
		.post( 'connect/stripe/account/deauthorize', {}, 'wc/v1' )
		.then( data => {
			dispatch( deauthorizeSuccess( siteId ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( deauthorizeFailure( siteId, deauthorizeAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

function deauthorizeSuccess( siteId ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
		siteId,
	};
}

function deauthorizeFailure( siteId, action, errorMessage ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
		error: errorMessage,
		siteId,
	};
}

/**
 * Action Creator: Get the initial OAuth URL for connecting a Stripe Account.
 *
 * @param {Number} siteId The id of the site for which to create an account.
 * @param {String} returnUrl The URL for Stripe to return the user to (to complete the setup)
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export const oauthInit = ( siteId, returnUrl, successAction = null, failureAction = null ) => (
	dispatch,
	getState
) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const initAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
		returnUrl,
		siteId,
	};

	dispatch( initAction );

	return request( siteId )
		.post( 'connect/stripe/oauth/init', { returnUrl }, 'wc/v1' )
		.then( data => {
			dispatch( oauthInitSuccess( siteId, initAction, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( oauthInitFailure( siteId, initAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

function oauthInitSuccess( siteId, { email }, { oauthUrl } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
		oauthUrl,
		siteId,
	};
}

function oauthInitFailure( siteId, action, { message } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
		error: message,
		siteId,
	};
}

/**
 * Action Creator: Complete the OAuth flow and connect the Stripe Account.
 *
 * @param {Number} siteId The id of the site for which to create an account.
 * @param {String} stripeCode The hexadecimal code provided by Stripe (GET param) when the user is returned to calypso
 * @param {String} stripeState The hexadecimal code provided by Stripe (GET param) when the user is returned to calypso
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export const oauthConnect = (
	siteId,
	stripeCode,
	stripeState,
	successAction = null,
	failureAction = null
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const connectAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT,
		stripeCode,
		stripeState,
		siteId,
	};

	dispatch( connectAction );

	return request( siteId )
		.post( 'connect/stripe/oauth/connect', { stripeCode, stripeState }, 'wc/v1' )
		.then( data => {
			dispatch( oauthConnectSuccess( siteId, connectAction, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( error => {
			dispatch( oauthConnectFailure( siteId, connectAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

function oauthConnectSuccess( siteId, action, { account_id } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
		connectedUserID: account_id,
		siteId,
	};
}

function oauthConnectFailure( siteId, action, { error, message } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
		error: message || error,
		siteId,
	};
}
