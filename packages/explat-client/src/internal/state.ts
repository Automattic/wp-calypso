/**
 * Internal dependencies
 */
import { ExperimentAssignment } from '../types';
import * as Validations from './validations';

const experimentNameToExperimentAssignment: Record< string, ExperimentAssignment | undefined > = {};

export function storeExperimentAssignment( experimentAssignment: ExperimentAssignment ): void {
	Validations.validateExperimentAssignment( experimentAssignment );

	const previousExperimentAssignment =
		experimentNameToExperimentAssignment[ experimentAssignment.experimentName ];
	if (
		previousExperimentAssignment &&
		experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp
	) {
		throw new Error(
			'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
		);
	}

	experimentNameToExperimentAssignment[
		experimentAssignment.experimentName
	] = experimentAssignment;
}

export function retrieveExperimentAssignment(
	experimentName: string
): ExperimentAssignment | undefined {
	return experimentNameToExperimentAssignment[ experimentName ];
}
