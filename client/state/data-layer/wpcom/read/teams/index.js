/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, } from 'state/action-types';
import { receiveTeams } from 'client/state/reader/teams/actions';
import wpcom from 'lib/wp';

export function handleTeamsRequest( store, action, next ) {
	wpcom.req.get( '/read/teams', { apiVersion: '1.2' } )
		.then(
			payload => {
				store.dispatch( receiveTeams( { payload } ) );
			},
			error => {
				store.dispatch( receiveTeams( { payload: error, isError: true } ) );
			}
		);
	next( action );
}

export default {
	[ READER_TEAMS_REQUEST ]: [ handleTeamsRequest ]
};

