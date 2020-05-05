/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
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
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';

/**
 * Action Creator: Clear any account connection completed notification.
 *
 * @param {number} siteId The id of the site for which to clear.
 * @returns {object} Action object
 */
export const clearCompletedNotification = ( siteId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const clearAction = {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_COMPLETED_NOTIFICATION,
		siteId,
	};

	dispatch( clearAction );
};

/**
 * Action Creator: Clear any error from a previous action.
 *
 * @param {number} siteId The id of the site for which to clear errors.
 * @returns {object} Action object
 */
export const clearError = ( siteId ) => ( dispatch, getState ) => {
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
 * @param {number} siteId The id of the site for which to create an account.
 * @param {string} email Email address (i.e. of the logged in WordPress.com user) to pass to Stripe.
 * @param {string} country Two character country code to pass to Stripe (e.g. US).
 * @param {string} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {string} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @returns {object} Action object
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
		.then( ( data ) => {
			dispatch( createSuccess( siteId, createAction, data ) );
			if ( successAction ) {
				dispatch( successAction( siteId, createAction, data ) );
			}
		} )
		.catch( ( error ) => {
			dispatch( createFailure( siteId, createAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( siteId, createAction, error ) );
			}
		} );
};

/**
 * Action Creator: Stripe Connect Account creation completed successfully
 *
 * @param {number} siteId The id of the site for which to create an account.
 * @param {object} email The email address used to create the account.
 * @param {object} account_id The Stripe Connect Account id created for the site (from the data object).
 * @returns {object} Action object
 */
function createSuccess( siteId, { email }, { account_id } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		connectedUserID: account_id,
		email,
		siteId,
	};
}

/**
 * Action Creator: Stripe Connect Account creation failed
 *
 * @param {number} siteId The id of the site for which account creation failed.
 * @param {object} action The action used to attempt to create the account.
 * @param {object} message Error message returned (from the error object).
 * @returns {object} Action object
 */
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
 * @param {number} siteId The id of the site for which to fetch connected account details.
 * @param {string} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {string} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @returns {object} Action object
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
		.then( ( data ) => {
			dispatch( fetchSuccess( siteId, fetchAction, data ) );
			if ( successAction ) {
				dispatch( successAction( siteId, fetchAction, data ) );
			}
		} )
		.catch( ( error ) => {
			dispatch( fetchFailure( siteId, fetchAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

/**
 * Action Creator: Stripe Connect Account details were fetched successfully
 *
 * @param {number} siteId The id of the site for which details were fetched.
 * @param {object} fetchAction The action used to fetch the account details.
 * @param {object} data The entire data object that was returned from the API.
 * @returns {object} Action object
 */
function fetchSuccess( siteId, fetchAction, data ) {
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

/**
 * Action Creator: Stripe Connect Account details were unable to be fetched
 *
 * @param {number} siteId The id of the site for which details could not be fetched.
 * @param {object} action The action used to attempt to fetch the account details.
 * @param {object} message Error message returned (from the error object).
 * @returns {object} Action object
 */
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
 * @param {number} siteId The id of the site to disconnect from Stripe Connect.
 * @param {string} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {string} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @returns {object} Action object
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
		.then( ( data ) => {
			dispatch( deauthorizeSuccess( siteId, deauthorizeAction, data ) );
			if ( successAction ) {
				dispatch( successAction( siteId, deauthorizeAction, data ) );
			}
		} )
		.catch( ( error ) => {
			dispatch( deauthorizeFailure( siteId, deauthorizeAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( error ) );
			}
		} );
};

/**
 * Action Creator: The Stripe Connect account was successfully deauthorized from our platform.
 *
 * @param {number} siteId The id of the site which had its account deauthorized.
 * @param {object} action The action used to deauthorize the account.
 * @param {object} data The entire data object that was returned from the API.
 * @returns {object} Action object
 */
// eslint-disable-next-line no-unused-vars
function deauthorizeSuccess( siteId, action, data ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
		siteId,
	};
}

/**
 * Action Creator: The Stripe Connect account was unable to be deauthorized from our platform.
 *
 * @param {number} siteId The id of the site which failed to have its account deauthorized.
 * @param {object} action The action used to attempt to deauthorize the account.
 * @param {object} errorMessage Error message returned.
 * @returns {object} Action object
 */
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
 * @param {number} siteId The id of the site for which to create an account.
 * @param {string} returnUrl The URL for Stripe to return the user to (to complete the setup)
 * @param {string} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {string} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @returns {object} Action object
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
		.then( ( data ) => {
			dispatch( oauthInitSuccess( siteId, initAction, data ) );
			if ( successAction ) {
				dispatch( successAction( siteId, initAction, data ) );
			}
		} )
		.catch( ( error ) => {
			dispatch( oauthInitFailure( siteId, initAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( siteId, initAction, error ) );
			}
		} );
};

/**
 * Action Creator: The Stripe Connect account OAuth flow was successfully initialized.
 *
 * @param {number} siteId The id of the site which we're doing OAuth for.
 * @param {object} action The action used to deauthorize the account.
 * @param {object} oauthUrl The URL to which the user needs to navigate to.
 * @returns {object} Action object
 */
function oauthInitSuccess( siteId, action, { oauthUrl } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
		oauthUrl,
		siteId,
	};
}

/**
 * Action Creator: The Stripe Connect account OAuth flow was unable to be initialized.
 *
 * @param {number} siteId The id of the site which we tried doing OAuth for.
 * @param {object} action The action used to attempt to deauthorize the account.
 * @param {object} message Error message returned (from the error object).
 * @returns {object} Action object
 */
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
 * @param {number} siteId The id of the site for which to create an account.
 * @param {string} stripeCode The code which Stripe will exchange for the account id.
 * @param {string} stripeState An arbitrary string passed throughout the flow as a CSRF protection.
 * @param {string} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {string} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @returns {object} Action object
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
		.post( 'connect/stripe/oauth/connect', { code: stripeCode, state: stripeState }, 'wc/v1' )
		.then( ( data ) => {
			dispatch( oauthConnectSuccess( siteId, connectAction, data ) );
			if ( successAction ) {
				dispatch( successAction( siteId, connectAction, data ) );
			}
		} )
		.then( () => {
			dispatch( fetchAccountDetails( siteId ) );
		} )
		.catch( ( error ) => {
			dispatch( oauthConnectFailure( siteId, connectAction, error ) );
			if ( failureAction ) {
				dispatch( failureAction( siteId, connectAction, error ) );
			}
		} );
};

/**
 * Action Creator: The Stripe Connect account OAuth flow was successfully completed.
 *
 * @param {number} siteId The id of the site which we're doing OAuth for.
 * @param {object} action The action used to complete OAuth for the account.
 * @param {object} account_id The account_id we are now connected to (from the data object)
 * @returns {object} Action object
 */
function oauthConnectSuccess( siteId, action, { account_id } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
		connectedUserID: account_id,
		siteId,
	};
}

/**
 * Action Creator: The Stripe Connect account OAuth flow was not able to be completed.
 *
 * @param {number} siteId The id of the site which we tried doing OAuth for.
 * @param {object} action The action used to try and complete OAuth for the account.
 * @param {object} error Error and message returned (from the error object).
 * @returns {object} Action object
 */
// Note: Stripe and WooCommerce Services server errors will be returned in message, but
// message will be empty for errors that the WooCommerce Services client generates itself
// so we need to grab the string from the error field inside the error object for those.
function oauthConnectFailure( siteId, action, { error, message } ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
		error: message || error,
		siteId,
	};
}
