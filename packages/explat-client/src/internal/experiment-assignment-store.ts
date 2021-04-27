/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';

const localStorageExperimentAssignmentsKey = 'explat-client-experiment-assignments';

type ExperimentAssignments = Record< string, ExperimentAssignment | undefined >;

function getLocalStorageExperimentAssignments(): ExperimentAssignments {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return {};
	}

	const maybeData = localStorage.getItem( localStorageExperimentAssignmentsKey );
	if ( maybeData === null ) {
		return {};
	}

	// TODO: Validate?
	return JSON.parse( maybeData ) as ExperimentAssignments;
}

function setLocalStorageExperimentAssignments(
	experimentAssignments: ExperimentAssignments
): void {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return;
	}

	window.localStorage.setItem(
		localStorageExperimentAssignmentsKey,
		JSON.stringify( experimentAssignments )
	);
}

/**
 * Class to store existing ExperimentAssignments in memory
 */
export default class ExperimentAssignmentStore {
	/**
	 * Store an ExperimentAssignment.
	 *
	 * @param experimentAssignment The ExperimentAssignment
	 */
	store( experimentAssignment: ExperimentAssignment ): void {
		Validations.validateExperimentAssignment( experimentAssignment );

		const localStorageExperimentAssignments = getLocalStorageExperimentAssignments();

		const previousExperimentAssignment =
			localStorageExperimentAssignments[ experimentAssignment.experimentName ];
		if (
			previousExperimentAssignment &&
			experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp
		) {
			throw new Error(
				'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
			);
		}

		setLocalStorageExperimentAssignments( {
			...localStorageExperimentAssignments,
			[ experimentAssignment.experimentName ]: experimentAssignment,
		} );
	}

	/**
	 * Retrieve an ExperimentAssignment.
	 *
	 * @param experimentName The experiment name.
	 */
	retrieve( experimentName: string ): ExperimentAssignment | undefined {
		const maybeExperimentAssignment = getLocalStorageExperimentAssignments()[ experimentName ];
		if ( maybeExperimentAssignment === undefined ) {
			return undefined;
		}

		return Validations.validateExperimentAssignment( maybeExperimentAssignment );
	}
}
