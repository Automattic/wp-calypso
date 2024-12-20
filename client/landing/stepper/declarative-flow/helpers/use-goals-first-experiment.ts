import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useMemo } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { getFlowFromURL } from '../../utils/get-flow-from-url';

export const EXPERIMENT_NAME = 'calypso_onboarding_goals_first_holdout_20250106';

/**
 * Check whether the user should have the "goals first" onboarding experience.
 *
 * Returns [ isLoading, isGoalsAtFrontExperiment ]
 */
export function useGoalsFirstExperiment(): [ boolean, boolean ] {
	const flow = useMemo( () => getFlowFromURL(), [] );

	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: flow === ONBOARDING_FLOW,
	} );

	/**
	 * If the user is not eligible, we'll treat them as if they were in the holdout group
	 * so we can provide the existing experience.
	 *
	 * This fallback is necessary because experimentAssignment returns null when the user
	 * is not eligible, and we're using this hook within steps that are used by other
	 * flows.
	 */
	const variationName = experimentAssignment?.variationName ?? 'holdout';

	return [ isLoading, variationName === 'control' ];
}
