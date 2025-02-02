import { isEnabled } from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useMemo } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { getFlowFromURL } from '../../utils/get-flow-from-url';
import { useGoalsFirstExperiment } from './use-goals-first-experiment';

export const EXPERIMENT_NAME = 'calypso_signup_onboarding_goals_first_bigsky_202501_v1';

/**
 * Check whether the user should have the "Big Sky before plans" onboarding experience.
 *
 * Returns [ isLoading, isBigSkyBeforePlans ]
 */
export function useBigSkyBeforePlans(): [ boolean, boolean ] {
	const flow = useMemo( () => getFlowFromURL(), [] );
	const [ isLoadingGoalsFirst, isGoalsFirstExperiment ] = useGoalsFirstExperiment();

	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible:
			! isLoadingGoalsFirst &&
			isGoalsFirstExperiment &&
			flow === ONBOARDING_FLOW &&
			! isEnabled( 'onboarding/force-big-sky-before-plan' ),
	} );

	if ( isEnabled( 'onboarding/force-big-sky-before-plan' ) ) {
		return [ false, true ];
	}

	/**
	 * This fallback is necessary because experimentAssignment returns null when the user
	 * is not eligible, and we're using this hook within steps that are used by other flows.
	 */
	const variationName = experimentAssignment?.variationName ?? 'control';

	return [ isLoading, variationName === 'treatment' ];
}
