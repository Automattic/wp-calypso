import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_signup_onboarding_domain_results_variants_202610';

const VARIATIONS = [
	'control',
	'free_banner_top',
	'tone_down_purchase',
	'custom_domain_banner_copy',
] as const;

export type DomainSearchResultsVariation = ( typeof VARIATIONS )[ number ];

/**
 * Assigns the onboarding domain search results experiment. Other flows that use the
 * domain search step always get control and are never assigned.
 */
export const useDomainSearchResultsExperiment = (
	flow: string | null
): { isLoading: boolean; variation: DomainSearchResultsVariation } => {
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isOnboardingFlow( flow ),
	} );

	return {
		isLoading,
		variation: VARIATIONS.find( ( name ) => name === assignment?.variationName ) ?? 'control',
	};
};
