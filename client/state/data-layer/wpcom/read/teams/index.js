/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/action-types';
import wpcom from 'lib/wp';
import inflight from 'lib/inflight';

export function handleTeamsRequest( store, action, next ) {
	const dedupedRequest = inflight.dedupedRequest(
		action.type,
		wpcom.req.get( '/read/teams', { apiVersion: '1.2' } ),
	);

	dedupedRequest.then(
			payload => {
				store.dispatch( {
					type: READER_TEAMS_RECEIVE,
					payload,
				} );
			},
			error => {
				store.dispatch( {
					type: READER_TEAMS_RECEIVE,
					payload: error,
					error: true,
				} );
			}
		);
	next( action );
}

export default {
	[ READER_TEAMS_REQUEST ]: [ handleTeamsRequest ]
};

