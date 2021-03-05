/**
 * Internal dependencies
 */
import type { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';
import { isRedirectPaymentMethod } from './translate-payment-method-names';
import config from '@automattic/calypso-config';

export default function isPaymentMethodEnabled(
	slug: CheckoutPaymentMethodSlug,
	allowedPaymentMethods: null | CheckoutPaymentMethodSlug[]
): boolean {
	// Redirect payments might not be possible in some cases - for example in the desktop app
	if ( isRedirectPaymentMethod( slug ) && ! config.isEnabled( 'upgrades/redirect-payments' ) ) {
		return false;
	}

	// By default, allow all payment methods
	if ( ! allowedPaymentMethods?.length ) {
		return true;
	}

	return allowedPaymentMethods.includes( slug );
}
