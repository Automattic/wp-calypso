/**
 * Internal Dependencies
 */
import { EXPERIMENT_FETCH, EXPERIMENT_ASSIGN } from 'state/action-types';
import { Experiment } from './reducer';

export const assignToExperiments = ( experiments: Experiment[] ) => ( {
	type: EXPERIMENT_ASSIGN,
	experiments,
} );

// todo: handle TTL
export const fetchExperiments = () => ( {
	type: EXPERIMENT_FETCH,
} );
