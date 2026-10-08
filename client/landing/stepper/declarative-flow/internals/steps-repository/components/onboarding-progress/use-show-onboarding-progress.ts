import { useViewportMatch } from '@wordpress/compose';

/**
 * The one breakpoint the onboarding progress indicator switches on.
 *
 * At or above it, the top bar has room for the three step names. Below it, the
 * names are dropped for the compact "1 of 3" counter. Exported so
 * `useOnboardingStepCounter` can gate on the same value: the two hooks are the
 * two halves of one switch, and if they drift apart the flow ends up with
 * either both indicators or neither.
 */
export const ONBOARDING_PROGRESS_BREAKPOINT = 'large';

/**
 * Single source of truth for whether the named step rail shows.
 *
 * The counter takes over below the breakpoint, so there is no viewport where
 * the flow shows no progress at all.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const hasRoomForNames = useViewportMatch( ONBOARDING_PROGRESS_BREAKPOINT );

	return isOnboardingFlow && hasRoomForNames;
}
