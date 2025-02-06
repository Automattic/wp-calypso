import { isEnabled } from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useMemo } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { getFlowFromURL } from '../../utils/get-flow-from-url';

export const EXPERIMENT_NAME = 'calypso_signup_onboarding_goals_first_flow_holdout_v2_20250131';

/**
 * Check whether the user should have the "goals first" onboarding experience.
 *
 * Returns [ isLoading, isGoalsAtFrontExperiment, variationName ]
 */
export function useGoalsFirstExperiment(): [ boolean, boolean, string ] {
	const flow = useMemo( () => getFlowFromURL(), [] );

	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: flow === ONBOARDING_FLOW && ! isEnabled( 'onboarding/force-goals-first' ),
	} );

	if ( isEnabled( 'onboarding/force-goals-first' ) ) {
		return [ false, true, 'control' ];
	}

	/**
	 * If the user is not eligible, we'll treat them as if they were in the
	 * holdout/control group so we can provide the existing experience.
	 *
	 * This fallback is necessary because experimentAssignment returns null when the user
	 * is not eligible, and we're using this hook within steps that are used by other flows.
	 */
	const variationName = experimentAssignment?.variationName ?? 'control';

	// There's a separate cohort for holdout reasons. But in terms of the "goals-first" experience,
	// both treatment cohorts see it.
	const isGoalsAtFrontExperiment = [ 'treatment_cumulative', 'treatment_frozen' ].includes(
		variationName
	);

	return [ isLoading, isGoalsAtFrontExperiment, variationName ];
}
