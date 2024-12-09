import { isEnabled } from '@automattic/calypso-config';
import { useEffect, useState } from 'react';

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
	const [ isLoading, setIsLoading ] = useState( true );
	useEffect( () => {
		if ( ! isEnabled( 'onboarding/goals-first' ) ) {
			return;
		}

		const id = setTimeout( () => setIsLoading( false ), 700 );
		return () => {
			clearTimeout( id );
		};
	}, [] );

	if ( ! isEnabled( 'onboarding/goals-first' ) ) {
		return [ false, false ];
	}

	return [ isLoading, true ];
}
