/**
 * Ordered "logical steps" surfaced by the Stepper indicator in the onboarding flow's
 * header. Alternate routes (e.g. `domains` and `use-my-domain`) collapse to the same
 * group so the indicator stays steady when the user navigates between them. The
 * `checkout` group is rendered outside the Stepper framework, in `client/my-sites/checkout`.
 *
 * Adding a logical step: append a group to `ONBOARDING_STEPPER_GROUPS` and map any
 * new slug(s) to it in `ONBOARDING_STEPPER_GROUP_BY_SLUG`.
 *
 * Removing a logical step: drop the group from the ordered list and remove its slug
 * entries. Total updates automatically.
 */

export const ONBOARDING_STEPPER_GROUPS = [ 'domain', 'plans', 'checkout' ] as const;

export type OnboardingStepperGroup = ( typeof ONBOARDING_STEPPER_GROUPS )[ number ];

/**
 * Query arg the flow adds to the checkout URL to name a group its visit never walked.
 * Checkout reads it rather than inferring anything from the reported step total.
 */
export const ONBOARDING_STEPPER_OMITTED_GROUP_PARAM = 'steps_omit';

/** The only group a visit can omit today: a preselected plan never sees the grid. */
export const ONBOARDING_OMITTED_PLANS_GROUP: OnboardingStepperGroup = 'plans';

export const ONBOARDING_STEPPER_GROUP_BY_SLUG: Record< string, OnboardingStepperGroup > = {
	domains: 'domain',
	'use-my-domain': 'domain',
	plans: 'plans',
};

export function getOnboardingStepperPosition(
	group: OnboardingStepperGroup,
	skipsPlans = false
): {
	current: number;
	total: number;
} {
	// A preselected plan never sees the grid — but skipping it does not make it unreachable: a
	// deep link to `/setup/onboarding/plans` lands on it without passing the flow root that
	// seeds the cart. Numbering a group the list left out would read "0 of 2", so a visit
	// standing on one keeps it.
	const groups = ONBOARDING_STEPPER_GROUPS.filter(
		( g ) => g === group || ! ( skipsPlans && g === ONBOARDING_OMITTED_PLANS_GROUP )
	);

	return {
		current: groups.indexOf( group ) + 1,
		total: groups.length,
	};
}
