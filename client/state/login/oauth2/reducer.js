/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	ROUTE_SET,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
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

export const clients = createReducer( initialClientsData, {
	[ OAUTH2_CLIENT_DATA_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const newData = Object.assign( {}, state[ data.id ], data );
		return Object.assign( {}, state, { [ data.id ]: newData } );
	}
} );

export const currentClientId = createReducer( null, {
	[ ROUTE_SET ]: ( state, { path, query } ) => startsWith( path, '/log-in' ) && query.client_id || null,
} );

export default combineReducers( {
	clients,
	currentClientId,
} );
