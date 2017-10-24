/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE ]: [
		dispatchRequest( handleAccountCreate, handleAccountCreateSuccess, handleAccountCreateFailure ),
	],
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST ]: [
		dispatchRequest( handleAccountFetch, handleAccountFetchSuccess, handleAccountFetchFailure ),
	],
};

export function handleAccountCreate( { dispatch }, action ) {
	const { email, countryCode, siteId } = action;
	dispatch(
		request( siteId, action, '/wc/v1' ).post( 'connect/stripe/account/', {
			email,
			country: countryCode,
		} )
	);
}

export function handleAccountCreateSuccess( store, action, { data } ) {
	const { siteId } = action;
	const { account_id } = data;

	store.dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		connectedUserID: account_id,
		siteId,
	} );
}

export function handleAccountCreateFailure( { dispatch }, action, error ) {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		error,
		siteId,
	} );
}

export function handleAccountFetch( { dispatch }, action ) {
	const { siteId } = action;
	dispatch( request( siteId, action, '/wc/v1' ).get( 'connect/stripe/account/', {} ) );
}

export function handleAccountFetchSuccess( store, action, { data } ) {
	const { siteId } = action;
	const { account_id, display_name, email, business_logo, legal_entity, payouts_enabled } = data;

	store.dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
		connectedUserID: account_id,
		displayName: display_name,
		email,
		firstName: legal_entity.first_name,
		isActivated: payouts_enabled,
		logo: business_logo,
		lastName: legal_entity.last_name,
		siteId,
	} );
}

export function handleAccountFetchFailure( { dispatch }, action, error ) {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
		error,
		siteId,
	} );
}
