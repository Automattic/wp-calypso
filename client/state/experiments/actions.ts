/**
 * Internal Dependencies
 */
import { EXPERIMENT_ASSIGN } from 'state/action-types';
import { ExperimentResponse } from 'state/experiments/types';

/**
 * Assign the user to the specified experiments
 *
 * @param experiments The experiments to assign to the user
 */
export const assignToExperiments = ( experiments: ExperimentResponse ) => ( {
	type: EXPERIMENT_ASSIGN,
	...experiments,
} );
