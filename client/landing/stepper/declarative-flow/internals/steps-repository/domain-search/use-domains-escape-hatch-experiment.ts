import { isOnboardingFlow } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';

/**
 * Custom hook for the calypso signup onboarding domains page escape hatch experiment.
 * @param flow - The current flow name
 * @returns [ isExperimentAssignmentLoading, ExperimentAssignment | null ]
 */
export const useDomainsEscapeHatchExperiment = ( flow: string ) => {
	return useExperiment( 'miro_test_experiment', {
		isEligible: isOnboardingFlow( flow ),
	} );
};
