import { isOnboardingFlow } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';

// TODO: replace with useExperiment( 'calypso_onboarding_domain_skip_step' ) once the
// experiment is ready. Forced on for now so the treatment can be verified in dev.
const FORCE_SHOW_DOMAIN_SKIP_STEP = true;

/**
 * Whether to show the "Skip this step" button on the domain search step.
 *
 * Gated to mobile viewports, the onboarding flow, and the empty/initial search
 * screen (once the user has searched, results take over the limited vertical
 * space). Eventually gated behind an A/B experiment — see the TODO above.
 */
export function useShowDomainSkipStep( {
	flow,
	isSkippable,
	query,
}: {
	flow: string;
	isSkippable: boolean;
	query: string | undefined;
} ): boolean {
	const isMobileViewport = useViewportMatch( 'small', '<' );

	return (
		FORCE_SHOW_DOMAIN_SKIP_STEP &&
		isMobileViewport &&
		isOnboardingFlow( flow ) &&
		isSkippable &&
		! query
	);
}
