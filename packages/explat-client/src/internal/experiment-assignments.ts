/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
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
 * Milliseconds between now and when the experiment was received for us to consider it recent.
 */
const maximumRecencyDelta = 1000 * 60 * 60 * 24 * 14; // 2 Weeks

/**
 * Check if an ExperimentAssignment is recent.
 * This is used to prevent experiments from running forever in offline contexts.
 *
 * @param experimentAssignment The experiment assignment to check
 */
export function isRecent( experimentAssignment: ExperimentAssignment ): boolean {
	const delta = Timing.monotonicNow() - experimentAssignment.retrievedTimestamp;
	return delta < maximumRecencyDelta;
}

/**
 * The ttl (in seconds) for a fallback assignment.
 * This limits the number of requests being sent to our server in the case of our server failing to return a working assignment
 * and will be the minimum amount of time in-between requests per experiment.
 */
const fallbackExperimentAssignmentTtl = 60;

/**
 * A fallback ExperimentAssignment we return when we can't retrieve one.
 *
 * @param experimentName The name of the experiment
 */
export const createFallbackExperimentAssignment = (
	experimentName: string
): ExperimentAssignment => ( {
	experimentName,
	variationName: null,
	retrievedTimestamp: Timing.monotonicNow(),
	ttl: fallbackExperimentAssignmentTtl,
	isFallbackExperimentAssignment: true,
} );
