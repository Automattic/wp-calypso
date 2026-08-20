import { useViewportMatch } from '@wordpress/compose';

/**
 * Temporarily disabled — flip to false to bring the indicator back.
 */
const IS_ONBOARDING_PROGRESS_DISABLED = true;

/**
 * Single source of truth for whether the onboarding progress indicator shows.
 *
 * Desktop-only. Mobile keeps the existing top-bar step counter.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );

	return ! IS_ONBOARDING_PROGRESS_DISABLED && isOnboardingFlow && isDesktop;
}
