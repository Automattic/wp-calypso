/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/action-types';
import wpcom from 'lib/wp';
import inflight from 'lib/inflight';

export function handleTeamsRequest( store, action, next ) {
	const dedupeKey = READER_TEAMS_REQUEST;
	if ( inflight.requestInflight( dedupeKey ) ) {
		return;
	}

	inflight.promiseTracker( wpcom.req.get( '/read/teams', { apiVersion: '1.2' } ) )
		.then(
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

