import { isOnboardingFlow } from '@automattic/onboarding';
import { useMemo } from 'react';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url'; // eslint-disable-line no-restricted-imports
import { useExperiment } from 'calypso/lib/explat'; // eslint-disable-line no-restricted-imports

export const EXPERIMENT_NAME =
	'calypso_signup_onboarding_domain_search_results_page_escape_hatch_202510';

/**
 * Hook for the domain search escape hatch experiment.
 */
export const useDomainSearchEscapeHatch = () => {
	const flow = useMemo( () => getFlowFromURL(), [] );

	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isOnboardingFlow( flow ),
	} );

	const variationName = experimentAssignment?.variationName ?? 'control';

	return [ isLoading, variationName ];
};
