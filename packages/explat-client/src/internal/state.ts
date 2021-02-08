/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';

type Store = {
	experimentNameToExperimentAssignment: Record< string, ExperimentAssignment | undefined >;
};

export function createStore(): Store {
	return {
		experimentNameToExperimentAssignment: {},
	};
}
/**
 * Store an ExperimentAssignment.
 *
 * @param store The store to use
 * @param experimentAssignment The ExperimentAssignment
 */
export function storeExperimentAssignment(
	store: Store,
	experimentAssignment: ExperimentAssignment
): void {
	Validations.validateExperimentAssignment( experimentAssignment );

	const previousExperimentAssignment =
		store.experimentNameToExperimentAssignment[ experimentAssignment.experimentName ];
	if (
		previousExperimentAssignment &&
		experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp
	) {
		throw new Error(
			'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
		);
	}

	store.experimentNameToExperimentAssignment[
		experimentAssignment.experimentName
	] = experimentAssignment;
}

/**
 * Retrieve an ExperimentAssignment.
 *
 * @param store The store to use
 * @param experimentName The experiment name.
 */
export function retrieveExperimentAssignment(
	store: Store,
	experimentName: string
): ExperimentAssignment | undefined {
	return store.experimentNameToExperimentAssignment[ experimentName ];
}
