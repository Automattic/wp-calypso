import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

// Placeholder experiment name until the real experiment is registered.
const EXPERIMENT_NAME = 'calypso_onboarding_progress_stepper_v1';

/**
 * Single source of truth for whether the onboarding progress indicator shows.
 *
 * Desktop-only. Mobile keeps the existing top-bar step counter.
 *
 * TEMPORARY: while no real experiment exists, a null/control assignment shows
 * the indicator so it is visible during development. When the experiment goes
 * live, flip this so the indicator shows only for the treatment assignment.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );
	const [ , assignment ] = useExperiment( EXPERIMENT_NAME );
	const isTreatment = assignment?.variationName === 'treatment';

	return isOnboardingFlow && isDesktop && ! isTreatment;
}
