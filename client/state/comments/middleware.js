/** @format */

/**
 * Internal dependencies
 */
import { COMMENTS_DELETE, COMMENTS_CHANGE_STATUS } from 'state/action-types';
import { getSiteComment } from 'state/selectors';

const handler = ( dispatch, action, getState ) => {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
		case COMMENTS_DELETE:
			const siteComment = getSiteComment( getState(), action.siteId, action.commentId );
			const previousStatus = siteComment && siteComment.status;
			return {
				...action,
				meta: Object.assign( {}, action.meta, { comment: { previousStatus } } ),
			};
		default:
			return action;
	}
};

export const commentsMiddleware = ( { dispatch, getState } ) => next => action => {
	return next( handler( dispatch, action, getState ) );
};

export default commentsMiddleware;
