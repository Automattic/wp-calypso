/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
} from 'woocommerce/state/action-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../../request';

/**
 * Action Creator: Create a Stripe Connect Account.
 *
 * @param {Number} siteId The id of the site for which to create (and connect) a Stripe Connect account.
 * @param {String} email Email address to pass to Stripe.
 * @param {String} country Two letter country code to pass to Stripe.
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
		.post( 'connect/stripe/account', { email, country }, '/wc/v1' )
		.then( data => {
			dispatch( createSuccess( siteId, data ) );
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

function createSuccess( siteId, data ) {
	const { account_id } = data;
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		connectedUserID: account_id,
		siteId,
	};
}

function createFailure( siteId, action, error ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		error,
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
		.get( 'connect/stripe/account', '/wc/v1' )
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

function fetchFailure( siteId, action, error ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
		error,
		siteId,
	};
}
