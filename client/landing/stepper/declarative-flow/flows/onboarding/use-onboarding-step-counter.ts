import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { skipsPlansStep } from '../../../utils/preselected-plan';
import {
	getOnboardingStepperPosition,
	ONBOARDING_STEPPER_GROUP_BY_SLUG,
} from './step-counter-config';
import type { OnboardSelect } from '@automattic/data-stores';

/**
 * Returns `{ current, total }` for the onboarding Stepper indicator.
 *
 * Returns `null` when the indicator should not be displayed — when:
 *  - the current flow isn't the onboarding flow, or
 *  - the step is not opted into the indicator (e.g. internal steps like
 *    `processing` / `create-site`), or
 *  - the viewport is not mobile (the indicator is mobile-only per the Figma spec).
 *
 * The shared step components (domain-search, use-my-domain, unified-plans) are
 * mounted by many flows, so this hook handles the flow gating internally to keep
 * call sites a single line.
 */
export function useOnboardingStepCounter(
	flow: string,
	slug: string
): { current: number; total: number } | null {
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const planCartItem = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
		[]
	);

	if ( flow !== ONBOARDING_FLOW || ! isMobileViewport ) {
		return null;
	}

	const group = ONBOARDING_STEPPER_GROUP_BY_SLUG[ slug ];
	if ( ! group ) {
		return null;
	}

	return getOnboardingStepperPosition(
		group,
		skipsPlansStep( getCurrentQueryParams(), planCartItem )
	);
}
