/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE, WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE } from 'woocommerce/state/action-types';
import request from 'woocommerce/state/sites/http-request';

export default {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE ]: [ dispatchRequest(
		handleAccountCreate,
		handleAccountCreateSuccess,
		handleAccountCreateFailure
	) ],
};

export function handleAccountCreate( { dispatch }, action ) {
	const { email, countryCode, siteId } = action;
	dispatch(
		request( siteId, action, '/wc/v1' ).
		post( 'connect/stripe/account/', { email, country: countryCode } )
	);
}

export function handleAccountCreateSuccess( store, action, { data } ) {
	const { email, siteId } = action;
	const { account_id } = data;

	store.dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		connectedUserID: account_id,
		email,
		siteId,
	} );
}

export function handleAccountCreateFailure( { dispatch }, action, error ) {
	const { email, siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
		email,
		error,
		siteId,
	} );
}
