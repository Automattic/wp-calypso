import { isEnabled } from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useEffect, useMemo, useState } from 'react';
import { getFlowFromURL } from '../../utils/get-flow-from-url';

/**
 * Check whether the user should have the "goals first" onboarding experience.
 * Returns [ isLoading, isGoalsAtFrontExperiment ]
 *
 * The experience is currently gated behind a feature flag which is loaded immediately,
 * but we want to code as if loading time might be involved. So this hook has a fake
 * timer.
 * Note: It's important that there be no timer in the production experience
 * i.e. when the feature flag is disabled.
 */
export function useGoalsFirstExperiment(): [ boolean, boolean ] {
	const flow = useMemo( () => getFlowFromURL(), [] );
	const isEligible = isEnabled( 'onboarding/goals-first' ) && flow === ONBOARDING_FLOW;

	const [ isLoading, setIsLoading ] = useState( true );
	useEffect( () => {
		if ( ! isEligible ) {
			return;
		}

		const id = setTimeout( () => setIsLoading( false ), 700 );
		return () => {
			clearTimeout( id );
		};
	}, [ isEligible ] );

	if ( ! isEligible ) {
		return [ false, false ];
	}

	return [ isLoading, true ];
}
