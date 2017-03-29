/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE,
	PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE,
	PUBLICIZE_SHARE_ACTION_DELETE,
	PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_DELETE_FAILURE,
	PUBLICIZE_SHARE_ACTION_EDIT,
	PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS,
	PUBLICIZE_SHARE_ACTION_EDIT_FAILURE,
} from 'state/action-types';

export function fetchPostShareActionsScheduled( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST,
			siteId,
			postId,
		} );

		const getScheduledPath = `/sites/${ siteId }/post/${ postId }/publicize/scheduled`;
		return wpcom.req.get( getScheduledPath, ( error, data ) => {
			if ( error || ! data.items ) {
				return dispatch( { type: PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE, siteId, postId, error } );
			}

			const actions = {};
			data.items.forEach( action => ( actions[ action.ID ] = action ) );
			dispatch( { type: PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS, siteId, postId, actions } );
		} );
	};
}

export function fetchPostShareActionsPublished( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST,
			siteId,
			postId,
		} );

		const getPublishedPath = `/sites/${ siteId }/post/${ postId }/publicize/published`;
		return wpcom.req.get( getPublishedPath, ( error, data ) => {
			if ( error || ! data.items ) {
				return dispatch( { type: PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE, siteId, postId, error } );
			}

			const actions = {};
			data.items.forEach( action => ( actions[ action.ID ] = action ) );
			dispatch( { type: PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS, siteId, postId, actions } );
		} );
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

		const deleteActionPath = `/sites/${ siteId }/post/${ postId }/publicize/action/${ actionId }/delete`;
		return wpcom.req.post( deleteActionPath, ( error, data ) => {
			if ( error || ! data.success ) {
				// TODO: consider return an WP_Error instance istead of `! data.item`
				return dispatch( { type: PUBLICIZE_SHARE_ACTION_DELETE_FAILURE, siteId, postId, actionId, error } );
			}

			dispatch( { type: PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS, siteId, postId, actionId } );
		} );
	};
}

export function editPostShareAction( siteId, postId, actionId, message, share_date ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTION_EDIT,
			siteId,
			postId,
			actionId,
		} );

		return wpcom.req.post( {
			path: `/sites/${ siteId }/post/${ postId }/publicize/action/${ actionId }/edit`,
			body: { message, share_date },
		}, ( error, data ) => {
			if ( error || ! data.item ) {
				// TODO: consider return an WP_Error instance istead of `! data.item`
				return dispatch( { type: PUBLICIZE_SHARE_ACTION_EDIT_FAILURE, siteId, postId, actionId, error } );
			}

			// TODO: until we have proper data coming
			data.item.ID = actionId;
			dispatch( { type: PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS, siteId, postId, actionId, item: data.item } );
		} );
	};
}
