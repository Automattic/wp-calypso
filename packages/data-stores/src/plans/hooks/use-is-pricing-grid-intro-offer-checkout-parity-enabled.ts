import { isEnabled } from '@automattic/calypso-config';

export const PRICING_GRID_INTRO_OFFER_CHECKOUT_PARITY_FEATURE_FLAG =
	'plans/pricing-grid-checkout-parity-intro-offers';

/**
 * Centralized eligibility for showing checkout-parity pricing (proration credits included)
 * in the plans pricing grid, scoped to *intro offer* plans only.
 */
export default function useIsPricingGridIntroOfferCheckoutParityEnabled(): boolean {
	return isEnabled( PRICING_GRID_INTRO_OFFER_CHECKOUT_PARITY_FEATURE_FLAG );
}
