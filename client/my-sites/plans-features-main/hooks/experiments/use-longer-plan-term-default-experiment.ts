import { useExperiment } from 'calypso/lib/explat';

/**
 * This hook although used for the experiment, it can be refactored in the end to
 * define the default term in the grid/plans page.
 */
const useLongerPlanTermDefaultExperiment = (): {
	isLoading: boolean;
	// TODO: Do we need undefined and null type here?
	term?: string | null;
	eligibleForExperiment: boolean;
} => {
	// TODO: Figure out how to define explicit types for the experiment assignment
	// variation names 'default_to_three_year_plans', 'default_to_two_year_plans'
	// and 'emphasize_savings_only'.
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_plans_page_emphasize_longer_plan_savings'
	);

	return {
		isLoading: isLoadingExperimentAssignment,
		term: experimentAssignment?.variationName,
		// TODO: Consider eligibility criteria ( en locale, etc. )
		eligibleForExperiment: true,
	};
};

export default useLongerPlanTermDefaultExperiment;
