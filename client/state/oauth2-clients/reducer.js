/**
 * External dependencies
 */
import qs from 'qs';
import urlModule from 'url';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
	OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
} from 'state/action-types';

export const initialClientsData = {
	930: {
		id: 930,
		name: 'vaultpress',
		title: 'Vaultpress',
		icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
	},
	973: {
		id: 973,
		name: 'akismet',
		title: 'Akismet',
		icon: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
	},
	978: {
		id: 978,
		name: 'polldaddy',
		title: 'Polldaddy',
		icon: 'https://polldaddy.com/images/polldaddy-wpcc-logo-2x.png',
	},
	1854: {
		id: 1854,
		name: 'gravatar',
		title: 'Gravatar',
		icon: 'https://gravatar.com/images/grav-logo-2x.png',
	},
	50019: {
		id: 50019,
		name: 'woo',
		title: 'WooCommerce',
		icon: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
	},
	50915: {
		id: 50915,
		name: 'woo',
		title: 'WooCommerce',
		icon: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
	},
	50916: {
		id: 50916,
		name: 'woo',
		title: 'WooCommerce.com',
		icon: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
	},
};

const getQueryStringParamsFromUrl = uri => {
	if ( typeof uri !== 'string' ) {
		return null;
	}

	const { query } = urlModule.parse( uri );

	if ( ! query ) {
		return null;
	}

	return qs.parse( query );
};

const getClientIdFromSignupUrl = signupUrl => {
	const signupUrlParams = getQueryStringParamsFromUrl( signupUrl );
	const oauth2RedirectUrl = signupUrlParams && signupUrlParams.oauth2_redirect;
	const oauth2RedirectParams = getQueryStringParamsFromUrl( oauth2RedirectUrl );

	return oauth2RedirectParams.client_id;
};

export default createReducer( initialClientsData, {
	[ OAUTH2_CLIENT_DATA_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const newData = Object.assign( {}, state[ data.id ], data );

		return Object.assign( {}, state, { [ data.id ]: newData } );
	},
	[ OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS ]: ( state, { signupUrl } ) => {
		const clientId = getClientIdFromSignupUrl( signupUrl );

		if ( ! clientId ) {
			return state;
		}

		const newData = Object.assign( {}, state[ clientId ], { signupUrl } );
		return Object.assign( {}, state, { [ clientId ]: newData } );
	},
} );
