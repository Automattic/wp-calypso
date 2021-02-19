/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';

/**
 * Class to store existing ExperimentAssignments in memory
 */
export default class ExperimentAssignmentStore {
	private experimentNameToExperimentAssignment: Record<
		string,
		ExperimentAssignment | undefined
	> = {};

	/**
	 * Store an ExperimentAssignment.
	 *
	 * @param experimentAssignment The ExperimentAssignment
	 */
	store( experimentAssignment: ExperimentAssignment ): void {
		Validations.validateExperimentAssignment( experimentAssignment );

		const previousExperimentAssignment = this.experimentNameToExperimentAssignment[
			experimentAssignment.experimentName
		];
		if (
			previousExperimentAssignment &&
			experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp
		) {
			throw new Error(
				'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
			);
		}

		this.experimentNameToExperimentAssignment[
			experimentAssignment.experimentName
		] = experimentAssignment;
	}

	/**
	 * Retrieve an ExperimentAssignment.
	 *
	 * @param experimentName The experiment name.
	 */
	retrieve( experimentName: string ): ExperimentAssignment | undefined {
		return this.experimentNameToExperimentAssignment[ experimentName ];
	}
}
