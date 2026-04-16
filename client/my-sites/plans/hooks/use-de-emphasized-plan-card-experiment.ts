import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_plans_de_emphasized_current_plan_card';

/**
 * A/B/C experiment to de-emphasize the current plan card on /plans.
 *
 * - control: Current layout (spotlight card on top)
 * - treatment_a: No spotlight card, all plans in grid
 * - treatment_b: No spotlight card, optimized 4-plan grid (hide Enterprise + Commerce for Free)
 */
export const useDeEmphasizedPlanCardExperiment = () => {
	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME );

	const variationName = experimentAssignment?.variationName ?? 'control';

	return {
		isLoading,
		isControl: variationName === 'control',
		isVariantA: variationName === 'treatment_a',
		isVariantB: variationName === 'treatment_b',
	};
};
