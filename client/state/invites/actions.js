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
 * Triggers a network request to fetch invites for the specified site.
 *
 * @param  {?Number}  siteId Site ID
 * @return {Function}        Action thunk
 */
export function requestInvites( siteId ) {
	return dispatch => {
		dispatch( {
			type: INVITES_REQUEST,
			siteId,
		} );

		wpcom.undocumented().invitesList( siteId, { force: 'wpcom', status: 'all' } )
		.then( ( { found, invites } ) => {
			dispatch( {
				type: INVITES_REQUEST_SUCCESS,
				siteId,
				found,
				invites,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: INVITES_REQUEST_FAILURE,
				siteId,
				error,
			} );
		} );
	};
}
