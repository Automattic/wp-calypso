import { ExperimentAssignment, MakeRequest } from '../types';
import { validateExperimentAssignment } from './validations';
import { monotonicNow } from './timing';
import * as ExperimentAssignments from './experiment-assignments'

export async function fetchExperimentAssignment(
	makeRequest: MakeRequest,
	experimentName: string,
	anonId?: string | null,
): Promise<ExperimentAssignment> {
	const retrievedTimestamp = monotonicNow();

	const { variations, ttl } = await makeRequest( {
		apiNamespace: 'wpcom',
		method: 'GET',
		path: '/v2/experiments/0.1.0/assignments/calypso',
		query: {
			anon_id: anonId,
			experiment_name: experimentName,
		},
	} );

	const fetchedExperimentAssignments = Object.entries( variations )
		.map( ( [ experimentName, variationName ] ) => ( {
			experimentName,
			variationName,
			retrievedTimestamp,
			ttl,
		} ) )
		.map( validateExperimentAssignment );

    if (fetchedExperimentAssignments.length > 1) {
		throw new Error('Received multiple experiment assignments while trying to fetch exactly one.')
	}

	if (fetchedExperimentAssignments.length === 0) {
		throw new Error('Received no experiment assignments while trying to fetch exactly one.')
	}

	const fetchedExperimentAssignment = fetchedExperimentAssignments[0]

	if (fetchedExperimentAssignment.experimentName !== experimentName) {
		throw new Error(`Newly fetched ExperimentAssignment's experiment name does not match request.`)
	}

	if (!ExperimentAssignments.isAlive(fetchedExperimentAssignment)) {
		throw new Error(`Newly fetched experiment isn't alive, something must be wrong.`);
	}

	return fetchedExperimentAssignment
}