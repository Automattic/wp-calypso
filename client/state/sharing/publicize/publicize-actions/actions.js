/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PUBLICIZE_SHARE_ACTIONS_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE,
} from 'state/action-types';

export function fetchPostShareActions( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTIONS_REQUEST,
			siteId,
			postId,
		} );

		return new Promise( ( resolve, reject ) => wpcom.req.get( `/sites/${ siteId }/post/${ postId }/publicize/actions`, ( error, data ) => {
			if ( error || ! data.items ) {
				dispatch( { type: PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE, siteId, postId, error } );
				reject();
			} else {
				const actions = {};
				data.items.forEach( action => ( actions[ action.ID ] = action ) );
				dispatch( { type: PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS, siteId, postId, actions } );
				resolve();
			}
		} ) );
	};
}
