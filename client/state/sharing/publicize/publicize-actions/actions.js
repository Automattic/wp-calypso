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
	PUBLICIZE_SHARE_ACTION_SCHEDULE,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE,
} from 'state/action-types';

export function fetchPostShareActionsScheduled( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST,
			siteId,
			postId,
		} );

		const getScheduledPath = `/sites/${ siteId }/posts/${ postId }/publicize/scheduled-actions`;
		return wpcom.req.get(
			{
				path: getScheduledPath,
				apiNamespace: 'wpcom/v2',
			},
			( error, data ) => {
				if ( error || ! data.items ) {
					return dispatch( {
						type: PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE,
						siteId,
						postId,
						error,
					} );
				}

				const actions = {};
				data.items.forEach( ( action ) => ( actions[ action.ID ] = action ) );
				dispatch( {
					type: PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS,
					siteId,
					postId,
					actions,
				} );
			}
		);
	};
}

export function fetchPostShareActionsPublished( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST,
			siteId,
			postId,
		} );

		const getPublishedPath = `/sites/${ siteId }/posts/${ postId }/publicize/published-actions`;
		return wpcom.req.get(
			{
				path: getPublishedPath,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			},
			( error, data ) => {
				if ( error || ! data.items ) {
					return dispatch( {
						type: PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE,
						siteId,
						postId,
						error,
					} );
				}

				const actions = {};
				data.items.forEach( ( action ) => ( actions[ action.ID ] = action ) );
				dispatch( {
					type: PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS,
					siteId,
					postId,
					actions,
				} );
			}
		);
	};
}

export function deletePostShareAction( siteId, postId, actionId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTION_DELETE,
			siteId,
			postId,
			actionId,
		} );

		const deleteActionPath = `/sites/${ siteId }/posts/${ postId }/publicize/scheduled-actions/${ actionId }`;
		return wpcom.req.get(
			{
				path: deleteActionPath,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			},
			( error, data ) => {
				if ( error || ! data ) {
					return dispatch( {
						type: PUBLICIZE_SHARE_ACTION_DELETE_FAILURE,
						siteId,
						postId,
						actionId,
						error,
					} );
				}

				dispatch( { type: PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS, siteId, postId, actionId } );
			}
		);
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

		const editActionPath = `/sites/${ siteId }/posts/${ postId }/publicize/scheduled-actions/${ actionId }`;
		return wpcom.req.put(
			{
				path: editActionPath,
				body: { message, share_date },
				apiNamespace: 'wpcom/v2',
			},
			( error, data ) => {
				if ( error || ! data.item ) {
					// TODO: consider return an WP_Error instance istead of `! data.item`
					return dispatch( {
						type: PUBLICIZE_SHARE_ACTION_EDIT_FAILURE,
						siteId,
						postId,
						actionId,
						error,
					} );
				}

				// TODO: until we have proper data coming
				data.item.ID = actionId;
				dispatch( {
					type: PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS,
					siteId,
					postId,
					actionId,
					item: data.item,
				} );
			}
		);
	};
}

export function schedulePostShareAction( siteId, postId, message, share_date, connections ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE_ACTION_SCHEDULE,
			siteId,
			postId,
			connections,
		} );

		return Promise.all(
			connections.map( ( connection_id ) =>
				wpcom.req.post( {
					path: `/sites/${ siteId }/posts/${ postId }/publicize/scheduled-actions/`,
					body: { message, share_date, connection_id },
					apiNamespace: 'wpcom/v2',
				} )
			)
		)
			.catch( ( error ) =>
				dispatch( {
					type: PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE,
					siteId,
					postId,
					error,
					connections,
				} )
			)
			.then( ( items ) =>
				dispatch( {
					type: PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS,
					siteId,
					postId,
					share_date,
					items,
					connections,
				} )
			);
	};
}
