import * as Timing from './timing';
import type { ExperimentAssignment } from '../types';

/**
 * Check if an ExperimentAssignment is still alive (as in the TTL).
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
 * The minimum ttl (in seconds) for any ExperimentAssignment.
 * This limits the number of requests being sent to our server in the case of our server failing to return a working assignment
 * and will be the minimum amount of time in-between requests per experiment.
 */
export const minimumTtl = 60;

/**
 * A fallback ExperimentAssignment we return when we can't retrieve one.
 * As it is used in fallback situations, this function must never throw.
 * @param experimentName The name of the experiment
 * @param ttl The time-to-live for the ExperimentAssignment, defaults to 60s
 */
export const createFallbackExperimentAssignment = (
	experimentName: string,
	ttl: number = minimumTtl
): ExperimentAssignment => ( {
	experimentName: experimentName,
	variationName: null,
	retrievedTimestamp: Timing.monotonicNow(),
	ttl: Math.max( minimumTtl, ttl ),
	isFallbackExperimentAssignment: true,
} );
