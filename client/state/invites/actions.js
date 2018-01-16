/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	INVITES_REQUEST,
	INVITES_REQUEST_FAILURE,
	INVITES_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Triggers a network request to fetch invites for the specified site and query.
 *
 * @param  {?Number}  siteId Site ID
 * @param  {Object}   query  Invites query (for pagination)
 * @return {Function}        Action thunk
 */
export function requestInvites( siteId, query = {} ) {
	return dispatch => {
		dispatch( {
			type: INVITES_REQUEST,
			siteId,
			query,
		} );

		wpcom.undocumented().invitesList( siteId, { ...query, force: 'wpcom', status: 'all' } )
		.then( ( { found, invites } ) => {
			dispatch( {
				type: INVITES_REQUEST_SUCCESS,
				siteId,
				query,
				found,
				invites,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: INVITES_REQUEST_FAILURE,
				siteId,
				query,
				error,
			} );
		} );
	};
}
