/**
 * Internal dependencies
 */
import { fetchReaderTeamsSuccess, ReaderTeamsResponse } from './actions';
import { wpcomRequest } from '../wpcom-request-controls';

export function* isA8cTeamMember(): Generator {
	try {
		const response = yield wpcomRequest( {
			method: 'GET',
			path: '/read/teams',
			apiVersion: '1.2',
		} );
		yield fetchReaderTeamsSuccess( response as ReaderTeamsResponse );
	} catch {
		// Ignore errors
	}
}
