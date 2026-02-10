import config from '@automattic/calypso-config';
import { isRedirectPaymentMethod } from './index';
import type { CheckoutPaymentMethodSlug } from './types';

export function isPaymentMethodEnabled(
	slug: CheckoutPaymentMethodSlug,
	allowedPaymentMethods: null | CheckoutPaymentMethodSlug[]
): boolean {
	// Existing cards have unique slugs but here we need only know if existing
	// cards are allowed.
	if ( slug.startsWith( 'existingCard' ) ) {
		slug = 'existingCard';
	}

	// Existing PayPal PPCP payment methods have unique slugs but here we need only
	// know if PayPal PPCP is allowed.
	if ( slug.startsWith( 'existingPayPalPPCP' ) ) {
		// Allow existing PayPal PPCP if PayPal PPCP is enabled
		slug = 'paypal-js';
	}

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
