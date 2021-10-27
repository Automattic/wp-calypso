import * as ExperimentAssignments from './experiment-assignments';
import localStorage from './local-storage';
import * as Validations from './validations';
import type { ExperimentAssignment } from '../types';

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

/**
 * Removes all expired and invalid experiment assignments in LocalStorage.
 */
export function removeExpiredExperimentAssignments(): void {
	for ( let i = localStorage.length - 1; i >= 0; i-- ) {
		const key = localStorage.key( i );

		if ( key?.startsWith( localStorageExperimentAssignmentKeyPrefix ) ) {
			const experimentName = key.slice( localStorageExperimentAssignmentKeyPrefix.length + 1 );
			const storedExperimentAssignment = retrieveExperimentAssignment( experimentName );

			// Remove the assignment if it is expired or undefined
			if (
				( storedExperimentAssignment &&
					! ExperimentAssignments.isAlive( storedExperimentAssignment ) ) ||
				typeof storedExperimentAssignment === 'undefined'
			) {
				localStorage.removeItem( key );
			}
		}
	}
}
