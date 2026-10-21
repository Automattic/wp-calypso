export const ONBOARDING_TOUR_SECTION_IDS = [
	'overview',
	'sites',
	'marketplace',
	'purchases',
	'referrals',
	'migrations',
	'woopayments',
	'partner-directory',
	'agency-tiers',
	'team',
	'growth-call',
] as const;

export type OnboardingTourSectionId = ( typeof ONBOARDING_TOUR_SECTION_IDS )[ number ];

export function isOnboardingTourSectionId( id: unknown ): id is OnboardingTourSectionId {
	return ONBOARDING_TOUR_SECTION_IDS.includes( id as OnboardingTourSectionId );
}
