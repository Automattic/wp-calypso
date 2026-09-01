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

export const ONBOARDING_STEPPER_GROUP_BY_SLUG: Record< string, OnboardingStepperGroup > = {
	domains: 'domain',
	'use-my-domain': 'domain',
	plans: 'plans',
};

/** The groups this visit actually walks through. A preselected plan never sees the grid. */
export function getOnboardingStepperGroups(
	skipsPlans = false
): readonly OnboardingStepperGroup[] {
	return skipsPlans
		? ONBOARDING_STEPPER_GROUPS.filter( ( group ) => group !== 'plans' )
		: ONBOARDING_STEPPER_GROUPS;
}

export function getOnboardingStepperPosition(
	group: OnboardingStepperGroup,
	skipsPlans = false
): {
	current: number;
	total: number;
} {
	const groups = getOnboardingStepperGroups( skipsPlans );

	return {
		current: groups.indexOf( group ) + 1,
		total: groups.length,
	};
}
