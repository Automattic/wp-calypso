import { isEnabled } from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useMemo } from 'react';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import type { AppState } from 'calypso/types';

export const EXPERIMENT_NAME = 'calypso_signup_onboarding_goals_first_flow_holdout_v2_20250131';

/**
 * Check whether the user should have the cumulative improvements to the "goals first" onboarding experience.
 *
 * Returns [ isLoading, isCumulativeExperience ]
 */
export function useGoalsFirstCumulativeExperience(): [ boolean, boolean ] {
	const flow = useMemo( () => getFlowFromURL(), [] );

	const inOnboardingFlow = flow === ONBOARDING_FLOW;

	const selectedSite = useSelector( ( state: AppState ) => getSelectedSite( state ) );
	const isSelectedSiteEligible =
		selectedSite?.options?.site_creation_flow === ONBOARDING_FLOW &&
		( selectedSite.options.created_at ?? '' ) > '2025-02-03T10:22:45+00:00'; // If created_at is null then this expression is false

	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible:
			( inOnboardingFlow || isSelectedSiteEligible ) &&
			! isEnabled( 'onboarding/force-goals-first' ),
	} );

	if ( isEnabled( 'onboarding/force-goals-first' ) ) {
		return [ false, true ];
	}

	/**
	 * If the user is not eligible, we'll treat them as if they were in the
	 * holdout/control group so we can provide the existing experience.
	 *
	 * This fallback is necessary because experimentAssignment returns null when the user
	 * is not eligible, and we're using this hook within steps that are used by other flows.
	 */
	const variationName = experimentAssignment?.variationName ?? 'control';

	return [ isLoading, variationName === 'treatment_cumulative' ];
}
