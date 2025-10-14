import { withStorageKey } from '@automattic/state-utils';
import { OAUTH2_CLIENT_DATA_RECEIVE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import ui from './ui/reducer';

export const gravatarClientData = {
	id: 1854,
	name: 'gravatar',
	title: 'Gravatar',
	icon: 'https://gravatar.com/images/grav-logo-blue.svg',
	favicon: 'https://gravatar.com/favicon.ico',
};

export const initialClientsData = {
	930: {
		id: 930,
		name: 'vaultpress',
		title: 'Vaultpress',
		icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
		url: 'https://vaultpress.com/',
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
		url: 'https://crowdsignal.com/',
	},
	1854: gravatarClientData,
	90057: {
		id: 90057,
		name: 'wpjobmanager',
		title: 'WP Job Manager',
		icon: 'https://wpjobmanager.com/wp-content/uploads/2023/06/JM-Letters.png',
		favicon: 'https://wpjobmanager.com/wp-content/uploads/2023/06/cropped-JM-512x512-1.png?w=32',
	},
	2665: {
		id: 2665,
		name: 'intensedebate',
		title: 'IntenseDebate',
		icon: 'https://intensedebate.com/images/svg/intensedebate-logo.svg',
	},
	50019: {
		id: 50019,
		name: 'woo',
		title: 'WooCommerce',
		icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
		url: 'https://woocommerce.com/',
	},
	50915: {
		id: 50915,
		name: 'woo',
		title: 'WooCommerce',
		icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
		url: 'https://woocommerce.com',
	},
	50916: {
		id: 50916,
		name: 'woo',
		title: 'WooCommerce.com',
		icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png',
		url: 'https://woocommerce.com',
	},
	76596: {
		id: 76596,
		name: 'vip',
		title: 'VIP Authentication',
		icon: 'https://i0.wp.com/developer.files.wordpress.com/2021/07/wordpressdotcomvip-logo-black1.png?w=100',
		url: 'https://wpvip.com',
	},
	68663: {
		id: 68663,
		name: 'jetpack-cloud',
		title: 'Jetpack Cloud',
		url: 'https://jetpack.com',
	},
	69040: {
		id: 69040,
		name: 'jetpack-cloud',
		title: 'Jetpack Cloud',
		url: 'https://jetpack.com',
	},
	69041: {
		id: 69041,
		name: 'jetpack-cloud',
		title: 'Jetpack Cloud',
		url: 'https://jetpack.com',
	},
	95928: {
		id: 95928,
		name: 'a8c-for-agencies',
		title: 'Automattic for Agencies',
		url: 'https://agencies.automattic.com',
	},
	95931: {
		id: 95931,
		name: 'a8c-for-agencies',
		title: 'Automattic for Agencies',
		url: 'https://agencies.automattic.com',
	},
	95932: {
		id: 95932,
		name: 'a8c-for-agencies',
		title: 'Automattic for Agencies',
		url: 'https://agencies.automattic.com',
	},
	95109: {
		id: 95109,
		name: 'studio',
		title: 'Studio by WordPress.com',
		url: 'https://developer.wordpress.com/studio/',
	},
	92099: {
		id: 92099,
		name: 'blaze-pro',
		title: 'Blaze Pro',
		url: 'https://blazepro.tumblr.com',
	},
	99370: {
		id: 99370,
		name: 'blaze-pro',
		title: 'Blaze Pro',
		url: 'https://blazepro.tumblr.com',
	},
	98166: {
		id: 98166,
		name: 'blaze-pro',
		title: 'Blaze Pro',
		url: 'https://blazepro.tumblr.com',
	},
};

export function clients( state = initialClientsData, action ) {
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

const combinedReducer = combineReducers( {
	clients,
	ui,
} );

export default withStorageKey( 'oauth2Clients', combinedReducer );
