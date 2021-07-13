import { wpcomRequest } from '../wpcom-request-controls';
import { fetchReaderTeamsSuccess, ReaderTeamsResponse } from './actions';

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
