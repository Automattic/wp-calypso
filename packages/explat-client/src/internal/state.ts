/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';
import * as ExperimentAssignments from './experiment-assignments';

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

	if (
		previousExperimentAssignment &&
		! previousExperimentAssignment.isFallbackExperimentAssignment &&
		ExperimentAssignments.isRecent( previousExperimentAssignment ) &&
		experimentAssignment.isFallbackExperimentAssignment
	) {
		throw new Error( 'Replacing recent ExperimentAssignment with fallback ExperimentAssignment.' );
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
