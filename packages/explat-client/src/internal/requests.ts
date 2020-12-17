import { ExperimentAssignment, MakeRequest } from '../types';
import { validateExperimentAssignment } from './validations';
import { monotonicNow } from './timing';

// TODO: Throttle
export async function fetchAllExperimentAssignments(
	makeRequest: MakeRequest,
	anonId?: string | null
): Promise< [ ExperimentAssignment[], number ] > {
	const retrievedTimestamp = monotonicNow();

	const { variations, ttl } = await makeRequest( {
		apiNamespace: 'wpcom',
		method: 'GET',
		path: '/v2/experiments/0.1.0/assignments/calypso',
		query: {
			anon_id: anonId,
		},
	} );

	const experimentAssignments = Object.entries( variations )
		.map( ( [ experimentName, variationName ] ) => ( {
			experimentName,
			variationName,
			retrievedTimestamp,
			ttl,
		} ) )
		.map( validateExperimentAssignment );

	return [ experimentAssignments, ttl ];
}
