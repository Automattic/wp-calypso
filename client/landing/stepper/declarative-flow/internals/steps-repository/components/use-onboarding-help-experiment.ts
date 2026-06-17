import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';

// Register the variation names ('control', 'treatment') in ExPlat alongside this slug.
export const ONBOARDING_DOMAINS_HELP_EXPERIMENT_NAME = 'calypso_onboarding_domains_help_cta_202606';

/**
 * Whether to show the "Need help?" Help Center entry on the onboarding
 * domain-selection steps (domains and use-my-domain).
 *
 * Gated by an A/B experiment: control hides the entry, treatment shows it.
 * Both domain steps read the same assignment so a control user never sees the
 * entry anywhere in the domain-selection sub-flow.
 *
 * Only eligible in the onboarding flow. While the assignment is loading we
 * return false (the control shape) so the entry is the default-hidden state and
 * never flashes in for users who ultimately resolve to control.
 */
export function useOnboardingHelpExperiment( flow: string ): {
	isLoading: boolean;
	showHelp: boolean;
} {
	const isEligible = isOnboardingFlow( flow );
	const [ isLoading, assignment ] = useExperiment( ONBOARDING_DOMAINS_HELP_EXPERIMENT_NAME, {
		isEligible,
	} );

	const showHelp = isEligible && ! isLoading && assignment?.variationName === 'treatment';

	return { isLoading, showHelp };
}
