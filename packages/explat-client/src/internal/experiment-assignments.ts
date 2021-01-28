/**
 * Internal dependencies
 */
import { ExperimentAssignment } from '../types';
import * as Timing from './timing';

/**
 * Check if an ExperimentAssignment is still alive (as in the TTL).
 *
 * @param experimentAssignment The experiment assignment to check
 */
export function isAlive( experimentAssignment: ExperimentAssignment ): boolean {
	return (
		Timing.monotonicNow() <
		experimentAssignment.ttl * Timing.MILLISECONDS_PER_SECOND +
			experimentAssignment.retrievedTimestamp
	);
}

/**
 * The null ExperimentAssignment we return when we can't retrieve one.
 */
export const createNullExperimentAssignment = (): ExperimentAssignment => ( {
	experimentName: 'null_experiment_assignment',
	variationName: null,
	retrievedTimestamp: 0,
	ttl: 0,
} );
