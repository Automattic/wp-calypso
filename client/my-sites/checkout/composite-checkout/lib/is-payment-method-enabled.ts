import config from '@automattic/calypso-config';
import { isRedirectPaymentMethod } from './translate-payment-method-names';
import type { CheckoutPaymentMethodSlug } from '@automattic/wpcom-checkout';

export default function isPaymentMethodEnabled(
	slug: CheckoutPaymentMethodSlug,
	allowedPaymentMethods: null | CheckoutPaymentMethodSlug[],
	countryCode: string
): boolean {
	const alwaysEnabledPaymentMethods = [ 'full-credits', 'free-purchase' ];
	if ( alwaysEnabledPaymentMethods.includes( slug ) ) {
		return true;
	}

	// If new cards are supported, so are existing cards.
	if ( slug.startsWith( 'existingCard' ) && allowedPaymentMethods?.includes( 'card' ) ) {
		return true;
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
