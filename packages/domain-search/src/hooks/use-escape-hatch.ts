import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat'; // eslint-disable-line no-restricted-imports

/**
 * Hook for the domain search escape hatch experiment.
 */
export const useDomainSearchEscapeHatch = ( flow: string ) => {
	return useExperiment( 'miro_test_experiment', {
		isEligible: isOnboardingFlow( flow ),
	} );
};
