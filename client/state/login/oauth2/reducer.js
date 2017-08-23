/**
 * External dependencies
 */
import { startsWith } from 'lodash';
import qs from 'qs';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	ROUTE_SET,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
	OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
} from 'state/action-types';

export const initialClientsData = {
	930: {
		id: 930,
		name: 'vaultpress',
		title: 'Vaultpress',
		img_url: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
		img_height: 50,
		img_width: 70,
	},
	973: {
		id: 973,
		name: 'akismet',
		title: 'Akismet',
		img_url: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
		img_height: 50,
		img_width: 70,
	},
	978: {
		id: 978,
		name: 'polldaddy',
		title: 'Polldaddy',
		img_url: 'https://polldaddy.com/images/polldaddy-wpcc-logo-2x.png',
		img_height: 50,
		img_width: 70,
	},
	1854: {
		id: 1854,
		name: 'gravatar',
		title: 'Gravatar',
		img_url: 'https://gravatar.com/images/grav-logo-2x.png',
		img_height: 50,
		img_width: 70,
	},
	50019: {
		id: 50019,
		name: 'woo',
		title: 'WooCommerce',
		img_url: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
		img_height: 41,
		img_width: 200,
	},
	50915: {
		id: 50915,
		name: 'woo',
		title: 'WooCommerce',
		img_url: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
		img_height: 41,
		img_width: 200,
	},
	50916: {
		id: 50916,
		name: 'woo',
		title: 'WooCommerce.com',
		img_url: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
		img_height: 41,
		img_width: 200,
	},
};

const getClientIdFromSignupUrl = ( signupUrl ) => {
	const urlParts = signupUrl.split( '?' );
	const queryString = urlParts[ 1 ];

	const params = qs.parse( queryString );
	const oauth2Redirect = params.oauth2_redirect;
	const oauth2RedirectParts = oauth2Redirect.split( '?' );
	const oauth2RedirectQueryString = oauth2RedirectParts[ 1 ];
	const oauth2RedirectParams = qs.parse( oauth2RedirectQueryString );

	return oauth2RedirectParams.client_id;
};

export const clients = createReducer( initialClientsData, {
	[ OAUTH2_CLIENT_DATA_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const newData = Object.assign( {}, state[ data.id ], data );
		return Object.assign( {}, state, { [ data.id ]: newData } );
	},
	[ OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS ]: ( state, { signupUrl } ) => {
		const clientId = getClientIdFromSignupUrl( signupUrl );
		const newData = Object.assign( {}, state[ clientId ], { signupUrl } );
		return Object.assign( {}, state, { [ clientId ]: newData } );
	},
} );

export const currentClientId = createReducer( null, {
	[ ROUTE_SET ]: ( state, { path, query } ) => startsWith( path, '/log-in' ) && query.client_id || null,
} );

export default combineReducers( {
	clients,
	currentClientId,
} );
