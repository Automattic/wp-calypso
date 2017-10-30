/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
} from 'woocommerce/state/action-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../../request';

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

function fetchFailure( siteId, action, errorMessage ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
		error: errorMessage,
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
