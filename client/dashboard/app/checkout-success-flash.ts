import { getPlanNames } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Product slug of a plan bought in the order. The checkout pending page adds it
 * to successful redirects into the Dashboard and classic My Home.
 */
export const CHECKOUT_SUCCESS_PLAN_PARAM = 'purchased_plan';

/**
 * The toast for a completed order, naming the plan when the current URL's
 * `purchased_plan` is a known one. The slug is untrusted, so only own keys count.
 */
export function getCheckoutSuccessMessage(): string {
	const planSlug = new URLSearchParams( window.location.search ).get( CHECKOUT_SUCCESS_PLAN_PARAM );
	const planNames: Record< string, string > = getPlanNames();
	if ( ! planSlug || ! Object.hasOwn( planNames, planSlug ) ) {
		return __( 'Your purchase was completed.' );
	}
	return sprintf(
		/* translators: %(planName)s is the name of the plan, e.g. "Business" */
		__( "You're in! The %(planName)s Plan is now active." ),
		{ planName: planNames[ planSlug ] }
	);
}
