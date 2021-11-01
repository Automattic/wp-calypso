import * as ExperimentAssignments from './experiment-assignments';
import localStorage from './local-storage';
import * as Validations from './validations';
import type { ExperimentAssignment } from '../types';

export const localStorageExperimentAssignmentKeyPrefix = 'explat-experiment-';

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

/**
 * Returns all keys in localStorage as an array.
 */
export function getAllLocalStorageKeys(): string[] {
	const range = ( i: number ) => [ ...Array( i ).keys() ];

	return range( localStorage.length ).map( ( i ) => localStorage.key( i ) as string );
}

/**
 * Checks to see if the key is an experiment assignment key, or more
 * accurately, if it starts with the localStorage experiment assignment key prefix.
 *
 * @param key the key to check
 */
export function isLocalStorageExperimentAssignmentKey( key: string ): boolean {
	return key.startsWith( localStorageExperimentAssignmentKeyPrefix );
}

/**
 * Returns the experiment name from a localStorage key assuming that the key begins with
 * the localStorage experiment assignment key prefix.
 *
 * @param key the key from which to retrieve the experiment name
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
				)
					return false;
			} catch ( _ ) {}
			return true;
		} )
		.map( localStorageExperimentAssignmentKey )
		.map( ( key ) => localStorage.removeItem( key ) );
}
