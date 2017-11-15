/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import { OAUTH2_CLIENT_DATA_REQUEST_SUCCESS } from 'state/action-types';

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
		icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
	},
	50915: {
		id: 50915,
		name: 'woo',
		title: 'WooCommerce',
		icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
	},
	50916: {
		id: 50916,
		name: 'woo',
		title: 'WooCommerce.com',
		icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
	},
};

export default createReducer( initialClientsData, {
	[ OAUTH2_CLIENT_DATA_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const newData = Object.assign( {}, state[ data.id ], data );

		return Object.assign( {}, state, { [ data.id ]: newData } );
	},
} );
