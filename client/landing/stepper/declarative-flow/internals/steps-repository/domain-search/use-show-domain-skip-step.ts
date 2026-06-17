import { isOnboardingFlow } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

export const DOMAIN_SKIP_STEP_EXPERIMENT_NAME = 'calypso_onboarding_domain_skip_step_202606';

/**
 * Whether to show the "Skip this step" button on the domain search step.
 *
 * Eligibility (mobile viewport, onboarding flow) gates the A/B experiment so the
 * population stays clean. The button then shows for the treatment variation, on a
 * skippable step, and only on the empty/initial search screen — once the user has
 * searched, results take over the limited mobile vertical space.
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
	const isEligible = isMobileViewport && isOnboardingFlow( flow );

	const [ isLoading, assignment ] = useExperiment( DOMAIN_SKIP_STEP_EXPERIMENT_NAME, {
		isEligible,
	} );

	if ( isLoading ) {
		return false;
	}

	return isEligible && isSkippable && assignment?.variationName === 'treatment' && ! query;
}
