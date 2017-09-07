/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_ERROR,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_SUCCESS,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_REQUEST ]: [ dispatchRequest(
		handleCreateRequest,
		handleCreateRequestSuccess,
		handleCreateRequestError
	) ],
};

export function handleCreateRequest( { dispatch }, action ) {
	const { email, countryCode, siteId } = action;
	dispatch(
		request( siteId, action, '/wc/v1' ).
		post( 'connect/stripe/account/', { email, country: countryCode } )
	);
}

export function handleCreateRequestSuccess( store, action, { data } ) {
	const { email, siteId } = action;
	const { body, status } = data;

	// TODO - is this needed, or will error get fired directly for us?
	if ( status !== 200 ) {
		return handleCreateRequestError( store, action, ( body.code || status ) );
	}

	store.dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_SUCCESS,
		connectedUserID: body.account_id,
		email,
		siteId,
	} );
}

export function handleCreateRequestError( { dispatch }, action, error ) {
	const { email, siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_ERROR,
		email,
		siteId,
		error,
	} );
}
