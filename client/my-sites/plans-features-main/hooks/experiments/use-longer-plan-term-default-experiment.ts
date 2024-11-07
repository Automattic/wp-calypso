import { type SupportedUrlFriendlyTermType } from '@automattic/plans-grid-next';

/**
 * This hook although used for the experiment, it can be refactored in the end to
 * define the default term in the grid/plans page.
 */
const useLongerPlanTermDefaultExperiment = (): {
	isLoading: boolean;
	term: SupportedUrlFriendlyTermType | undefined;
	eligibleForExperiment: boolean;
} => {
	return {
		isLoading: false,
		term: '2yearly', // '3yearly', 'yearly', undefined
		eligibleForExperiment: true,
	};
};

export default useLongerPlanTermDefaultExperiment;
