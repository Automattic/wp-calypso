import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_static_site_import_plans_skip_to_preview';

const TREATMENT = 'treatment';

/**
 * Whether the plans step offers Skip, which builds a free preview site of the import
 * instead of going to checkout. Only new destinations are assigned.
 */
export const usePlansSkipExperiment = ( isEligible: boolean ): boolean => {
	const [ , assignment ] = useExperiment( EXPERIMENT_NAME, { isEligible } );

	return assignment?.variationName === TREATMENT;
};
