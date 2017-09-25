/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE } from 'woocommerce/state/action-types';

export function createAccount( siteId, email, countryCode ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
		countryCode,
		email,
		siteId,
	};
}
