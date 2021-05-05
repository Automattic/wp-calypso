/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';
import localStorage from './local-storage';

const localStorageExperimentAssignmentKeyPrefix = 'explat-experiment-';

const localStorageExperimentAssignmentKey = ( experimentName: string ): string =>
	`${ localStorageExperimentAssignmentKeyPrefix }-${ experimentName }`;

/**
 * Store an ExperimentAssignment.
 *
 * @param experimentAssignment The ExperimentAssignment
 */
export function storeExperimentAssignment( experimentAssignment: ExperimentAssignment ): void {
	Validations.validateExperimentAssignment( experimentAssignment );

	const previousExperimentAssignment = retrieveExperimentAssignment(
		experimentAssignment.experimentName
	);
	if (
		previousExperimentAssignment &&
		experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp
	) {
		throw new Error(
			'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
		);
	}

	localStorage.setItem(
		localStorageExperimentAssignmentKey( experimentAssignment.experimentName ),
		JSON.stringify( experimentAssignment )
	);
}

/**
 * Retrieve an ExperimentAssignment.
 *
 * @param experimentName The experiment name.
 */
export function retrieveExperimentAssignment(
	experimentName: string
): ExperimentAssignment | undefined {
	const maybeExperimentAssignmentJson = localStorage.getItem(
		localStorageExperimentAssignmentKey( experimentName )
	);
	if ( ! maybeExperimentAssignmentJson ) {
		return undefined;
	}

	return Validations.validateExperimentAssignment( JSON.parse( maybeExperimentAssignmentJson ) );
}
