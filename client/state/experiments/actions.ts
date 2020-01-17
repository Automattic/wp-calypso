/**
 * Internal Dependencies
 */
import { EXPERIMENT_FETCH, EXPERIMENT_ASSIGN } from 'state/action-types';
import { ExperimentResponse } from 'state/experiments/types';

export const assignToExperiments = ( experiments: ExperimentResponse ) => ( {
	type: EXPERIMENT_ASSIGN,
	...experiments,
} );

export const fetchExperiments = ( anonId: string ) => ( {
	type: EXPERIMENT_FETCH,
	anonId,
} );
