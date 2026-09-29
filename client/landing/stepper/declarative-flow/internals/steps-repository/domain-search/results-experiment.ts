import { isOnboardingFlow } from '@automattic/onboarding';

/**
 * Variations of the onboarding domain search results experiment.
 */
export type DomainSearchResultsVariation =
	| 'control'
	| 'free_banner_top'
	| 'tone_down_purchase'
	| 'custom_domain_banner_copy'
	| 'free_domain_banner_copy';

// Placeholder until the ExPlat experiment exists. Set a variation name here to preview it.
const DOMAIN_SEARCH_RESULTS_VARIATION: DomainSearchResultsVariation = 'control';

export const getDomainSearchResultsVariation = (
	flow: string | null
): DomainSearchResultsVariation =>
	isOnboardingFlow( flow ) ? DOMAIN_SEARCH_RESULTS_VARIATION : 'control';
