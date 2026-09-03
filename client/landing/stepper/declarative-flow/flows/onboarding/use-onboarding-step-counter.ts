import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { ONBOARDING_PROGRESS_BREAKPOINT } from '../../internals/steps-repository/components/onboarding-progress/use-show-onboarding-progress';
import {
	getOnboardingStepperPosition,
	ONBOARDING_STEPPER_GROUP_BY_SLUG,
} from './step-counter-config';

/**
 * Returns `{ current, total }` for the compact onboarding step counter.
 *
 * Returns `null` when the counter should not be displayed — when:
 *  - the current flow isn't the onboarding flow, or
 *  - the step is not opted into the indicator (e.g. internal steps like
 *    `processing` / `create-site`), or
 *  - the viewport is wide enough for the named step rail to show instead.
 *
 * The counter used to be mobile-only, which left everything between the mobile
 * breakpoint and the desktop one with no progress indicator at all. It now
 * covers the whole range below `ONBOARDING_PROGRESS_BREAKPOINT`, so the two
 * treatments hand off to each other rather than leaving a gap.
 *
 * The shared step components (domain-search, use-my-domain, unified-plans) are
 * mounted by many flows, so this hook handles the flow gating internally to keep
 * call sites a single line.
 */
export function useOnboardingStepCounter(
	flow: string,
	slug: string
): { current: number; total: number } | null {
	const hasRoomForNames = useViewportMatch( ONBOARDING_PROGRESS_BREAKPOINT );

	if ( flow !== ONBOARDING_FLOW || hasRoomForNames ) {
		return null;
	}

	const group = ONBOARDING_STEPPER_GROUP_BY_SLUG[ slug ];
	if ( ! group ) {
		return null;
	}

	return getOnboardingStepperPosition( group );
}
