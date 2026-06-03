import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

// Placeholder experiment name until the real experiment is registered.
const EXPERIMENT_NAME = 'calypso_onboarding_progress_stepper_v1';

/**
 * Single source of truth for whether the onboarding progress indicator shows.
 *
 * Desktop-only. Mobile keeps the existing top-bar step counter.
 *
 * While the experiment assignment is loading we return false, so the indicator
 * is never shown on a not-yet-resolved guess and then toggled once the
 * assignment lands. This keeps the header from flickering between the legacy
 * back link and the stepper.
 *
 * TEMPORARY: while no real experiment exists, a null/control assignment shows
 * the indicator so it is visible during development. When the experiment goes
 * live, flip the `! isTreatment` below to `isTreatment` so the indicator shows
 * only for the treatment assignment. The isLoading guard stays as-is.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME );
	const isTreatment = assignment?.variationName === 'treatment';

	if ( isLoading ) {
		return false;
	}

	return isOnboardingFlow && isDesktop && ! isTreatment;
}
