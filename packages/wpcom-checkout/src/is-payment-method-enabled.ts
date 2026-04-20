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
	// know if stored payment methods are allowed.
	if ( slug.startsWith( 'existingPayPalPPCP' ) ) {
		// Both existing cards and existing PayPal PPCP use the same backend type
		// (WPCOM_Billing_MoneyPress_Stored), so we normalize to existingCard
		slug = 'existingCard';
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
