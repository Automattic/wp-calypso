import { getPlanNames } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Query params the checkout pending page adds to a successful redirect, read by
 * `<CheckoutSuccessFlashMessage>` in the Dashboard app shell and by classic My
 * Home.
 */
export const CHECKOUT_SUCCESS_FLASH_ID = 'checkout-success';

/**
 * Product slug of the plan bought in that order, if any.
 */
export const CHECKOUT_SUCCESS_PLAN_PARAM = 'purchased_plan';

/**
 * The toast for a completed order, naming the plan when `planSlug` is a known
 * one. The slug comes from the URL, so only own keys count.
 */
export function getCheckoutSuccessMessage( planSlug: string | null ): string {
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
