/**
 * Internal dependencies
 */
import { OAUTH2_CLIENT_DATA_RECEIVE } from 'state/action-types';

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
		name: 'crowdsignal',
		title: 'Crowdsignal',
		icon: 'https://app.crowdsignal.com/images/logo-white.png',
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

export default function oauth2Clients( state = initialClientsData, action ) {
	switch ( action.type ) {
		case OAUTH2_CLIENT_DATA_RECEIVE:
			return {
				...state,
				[ action.data.id ]: {
					...state[ action.data.id ],
					...action.data,
				},
			};
		default:
			return state;
	}
}
