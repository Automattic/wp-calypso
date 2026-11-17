import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_setup_your_site_ai_bring_your_ai_tool_202611';

const TREATMENT = 'bring_your_ai_tool';

/**
 * Assigns the "Build with AI" card experiment when the step renders; ineligible visitors are
 * never assigned.
 */
export const useAiToolExperiment = (
	isEligible: boolean
): { isLoading: boolean; isTreatment: boolean } => {
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, { isEligible } );

	return {
		isLoading,
		isTreatment: assignment?.variationName === TREATMENT,
	};
};
