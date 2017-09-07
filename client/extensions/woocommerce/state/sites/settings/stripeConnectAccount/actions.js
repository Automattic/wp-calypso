/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_REQUEST,
} from 'woocommerce/state/action-types';

export function createAccount( siteId, email, countryCode ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_REQUEST,
		countryCode,
		email,
		siteId,
	};
}
