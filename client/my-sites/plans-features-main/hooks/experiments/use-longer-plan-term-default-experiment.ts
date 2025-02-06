import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';

const useTermFromExperimentVariant = (
	experimentVariant: string | null | undefined
): string | null => {
	switch ( experimentVariant ) {
		case 'default_to_three_year_plans':
			return '3yearly';
		case 'default_to_two_year_plans':
			return '2yearly';
		default:
			return null;
	}
};

/**
 * Returns:
 * - the term as yearly, 2yearly, 3yearly (etc.) to be used as default in the plans
 * page based on the experiment variant
 * - OR null/undefined if control variant or if the experiment is still loading (Subject to change)
 *
 * This hook although used for the experiment, it can be refactored in the end to
 * define the default term in the grid/plans page.
 *
 */
const useLongerPlanTermDefaultExperiment = (
	flowName?: string | null
): {
	isLoadingExperiment: boolean;
	term?: string | null;
	// TODO: Consider removing this and always return concrete term values (where undefined/null would mean no term savings)
	isEligibleForTermSavings: boolean;
} => {
	// TODO: Figure out how to define explicit types for the experiment assignment
	// variation names 'default_to_three_year_plans', 'default_to_two_year_plans'
	// and 'emphasize_savings_only'.
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_plans_page_emphasize_longer_plan_savings',
		{
			isEligible: flowName === ONBOARDING_FLOW,
		}
	);
	const term = useTermFromExperimentVariant( experimentAssignment?.variationName );

	return {
		isLoadingExperiment: isLoadingExperimentAssignment,
		term: isLoadingExperimentAssignment ? undefined : term,
		isEligibleForTermSavings: !! (
			experimentAssignment?.variationName && experimentAssignment.variationName !== 'control'
		),
	};
};

export default useLongerPlanTermDefaultExperiment;
