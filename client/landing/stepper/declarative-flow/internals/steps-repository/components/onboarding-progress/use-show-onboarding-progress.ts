import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_signup_onboarding_progress_bar_202606_v1';

/**
 * Single source of truth for whether the onboarding progress indicator shows.
 *
 * Desktop-only. Mobile keeps the existing top-bar step counter.
 *
 * While the experiment assignment is loading we return false, so the indicator
 * is never shown on a not-yet-resolved guess and then toggled once the
 * assignment lands. This keeps the header from flickering between the legacy
 * back link and the stepper.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME );
	const isTreatment = assignment?.variationName === 'progress_bar';

	if ( isLoading ) {
		return false;
	}

	return isOnboardingFlow && isDesktop && isTreatment;
}
