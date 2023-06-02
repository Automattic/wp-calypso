import * as ExperimentAssignments from './experiment-assignments';
import localStorage from './local-storage';
import * as Validations from './validations';
import type { ExperimentAssignment } from '../types';

/**
 * Exported for testing purposes only.
 */
export const localStorageExperimentAssignmentKeyPrefix = 'explat-experiment-';

/**
 * Exported for testing purposes only.
 */
export const localStorageExperimentAssignmentKey = ( experimentName: string ): string =>
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

const range = ( i: number ) => [ ...Array( i ).keys() ];

/**
 * Exported for testing purposes only.
 */
export function getAllLocalStorageKeys(): string[] {
	return range( localStorage.length ).map( ( i ) => localStorage.key( i ) as string );
}

/**
 * Exported for testing purposes only.
 */
export function isLocalStorageExperimentAssignmentKey( key: string ): boolean {
	return key.startsWith( localStorageExperimentAssignmentKeyPrefix );
}

/**
 * Exported for testing purposes only.
 */
export function experimentNameFromLocalStorageExperimentAssignmentKey( key: string ): string {
	return key.slice( localStorageExperimentAssignmentKeyPrefix.length + 1 );
}

/**
 * Removes all expired and invalid experiment assignments in LocalStorage.
 */
export function removeExpiredExperimentAssignments(): void {
	getAllLocalStorageKeys()
		.filter( isLocalStorageExperimentAssignmentKey )
		.map( experimentNameFromLocalStorageExperimentAssignmentKey )
		.filter( ( experimentName ) => {
			try {
				if (
					ExperimentAssignments.isAlive(
						retrieveExperimentAssignment( experimentName ) as ExperimentAssignment
					)
				) {
					return false;
				}
			} catch ( _ ) {}
			return true;
		} )
		.map( localStorageExperimentAssignmentKey )
		.map( ( key ) => localStorage.removeItem( key ) );
}
