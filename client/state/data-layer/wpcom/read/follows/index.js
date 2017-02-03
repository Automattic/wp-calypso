/**
 * Internal dependencies
 */
import { READER_FOLLOWS_REQUEST, READER_FOLLOWS_RECEIVE } from 'state/action-types';
import wpcom from 'lib/wp';

export function handleFollowsRequest( store, action, next ) {
	wpcom.req.get( '/read/following/mine', { apiVersion: '1.2' } )
		.then(
			payload => {
				store.dispatch( {
					type: READER_FOLLOWS_RECEIVE,
					payload,
				} );
			},
			error => {
				store.dispatch( {
					type: READER_FOLLOWS_RECEIVE,
					payload: error,
					error: true,
				} );
			}
		);
	next( action );
}

export default {
	[ READER_FOLLOWS_REQUEST ]: [ handleFollowsRequest ]
};

