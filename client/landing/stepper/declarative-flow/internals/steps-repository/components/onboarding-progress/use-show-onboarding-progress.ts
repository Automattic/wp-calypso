import { useViewportMatch } from '@wordpress/compose';

/**
 * Single source of truth for whether the onboarding progress indicator shows.
 *
 * Desktop-only. Mobile keeps the existing top-bar step counter.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );

	return isOnboardingFlow && isDesktop;
}
