/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PUBLICIZE_SHARE_ACTIONS_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE,
	PUBLICIZE_SHARE_ACTION_DELETE,
	PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_DELETE_FAILURE,
	PUBLICIZE_SHARE_ACTION_EDIT,
	PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS,
	PUBLICIZE_SHARE_ACTION_EDIT_FAILURE,
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

export function deletePostShareAction( siteId, postId, actionId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTION_DELETE,
			siteId,
			postId,
			actionId
		} );

		return new Promise( ( resolve, reject ) => wpcom.req.post(
			`/sites/${ siteId }/post/${ postId }/publicize/action/${ actionId }/delete`
		, ( error, data ) => {
			if ( error || ! data.success ) {
				dispatch( { type: PUBLICIZE_SHARE_ACTION_DELETE_FAILURE, siteId, postId, actionId, error } );
				reject();
			} else {
				dispatch( { type: PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS, siteId, postId, actionId } );
				resolve();
			}
		} ) );
	};
}

export function editPostShareAction( siteId, postId, actionId, message, share_date ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTION_EDIT,
			siteId,
			postId,
			actionId
		} );

		return new Promise( ( resolve, reject ) => wpcom.req.post( {
			path: `/sites/${ siteId }/post/${ postId }/publicize/action/${ actionId }/edit`,
			body: { message, share_date }
		}, ( error, data ) => {
			if ( error || ! data.item ) {
				dispatch( { type: PUBLICIZE_SHARE_ACTION_EDIT_FAILURE, siteId, postId, actionId, error } );
				reject();
			} else {
				//TODO: until we have proper data coming
				data.item.ID = actionId;
				dispatch( { type: PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS, siteId, postId, actionId, item: data.item } );
				resolve();
			}
		} ) );
	};
}

