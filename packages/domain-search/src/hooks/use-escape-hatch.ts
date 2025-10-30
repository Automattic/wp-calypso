import { isOnboardingFlow } from '@automattic/onboarding';
import { useMemo } from 'react';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url'; // eslint-disable-line no-restricted-imports
import { useExperiment } from 'calypso/lib/explat'; // eslint-disable-line no-restricted-imports

export const EXPERIMENT_NAME = 'miro_test_experiment';

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
