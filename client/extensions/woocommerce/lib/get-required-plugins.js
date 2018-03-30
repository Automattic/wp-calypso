/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export function getRequiredPluginsList() {
	return {
		woocommerce: translate( 'WooCommerce' ),
		'woocommerce-gateway-stripe': translate( 'WooCommerce Stripe Gateway' ),
		'woocommerce-services': translate( 'WooCommerce Services' ),
	};
}
