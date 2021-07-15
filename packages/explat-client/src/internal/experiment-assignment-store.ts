/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';
import { get, set, createStore } from 'idb-keyval';

const experimentAssignmentStore = createStore( 'explat', 'experimentAssignments' );

/**
 * Store an ExperimentAssignment.
 *
 * @param experimentAssignment The ExperimentAssignment
 */
export async function storeExperimentAssignment(
	experimentAssignment: ExperimentAssignment
): Promise< void > {
	Validations.validateExperimentAssignment( experimentAssignment );

	const previousExperimentAssignment = await retrieveExperimentAssignment(
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

	return set(
		experimentAssignment.experimentName,
		experimentAssignment,
		experimentAssignmentStore
	);
}

/**
 * Retrieve an ExperimentAssignment.
 *
 * @param experimentName The experiment name.
 */
export async function retrieveExperimentAssignment(
	experimentName: string
): Promise< ExperimentAssignment | undefined > {
	const maybeExperimentAssignmentJson = await get( experimentName, experimentAssignmentStore );
	if ( ! maybeExperimentAssignmentJson ) {
		return undefined;
	}

	return Validations.validateExperimentAssignment( maybeExperimentAssignmentJson );
}
