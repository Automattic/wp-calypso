import { ExperimentAssignment } from '../types';
import * as Validations from './validations';

const experiments: Record< string, ExperimentAssignment > = {};

export function storeExperimentAssignment( experimentAssignment: ExperimentAssignment ): void {
	Validations.validateExperimentAssignment( experimentAssignment );

	const previousExperimentAssignment = experiments[ experimentAssignment.experimentName ];
	if ( experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp ) {
		throw new Error(
			'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
		);
	}

	experiments[ experimentAssignment.experimentName ] = experimentAssignment;
}

export function retrieveExperimentAssignment(
	experimentName: string
): ExperimentAssignment | undefined {
	return experiments[ experimentName ];
}
