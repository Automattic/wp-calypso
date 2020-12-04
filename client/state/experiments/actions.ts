/**
 * Internal Dependencies
 */
import { EXPERIMENT_ASSIGN } from 'calypso/state/action-types';
import { ExperimentResponse } from 'calypso/state/experiments/types';

import 'calypso/state/experiments/init';

/**
 * Assign the user to the specified experiments
 *
 * @param experiments The experiments to assign to the user
 */
export const assignToExperiments = ( experiments: ExperimentResponse ) => ( {
	type: EXPERIMENT_ASSIGN,
	...experiments,
} );
