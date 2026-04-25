import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_plans_de_emphasized_current_plan_card';

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
