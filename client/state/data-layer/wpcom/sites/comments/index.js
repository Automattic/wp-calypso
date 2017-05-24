/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { forEach, groupBy } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_LIST_REQUEST, COMMENTS_RECEIVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

import { errorNotice } from 'state/notices/actions';

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/
const fetchCommentsList = ( { dispatch }, action ) => {
	const { query } = action;
	const { listType } = query;

	if ( 'site' === listType ) {
		const {
			siteId,
			status = 'unapproved',
			type = 'comment',
		} = query;

		return dispatch( http( {
			method: 'GET',
			path: `/sites/${ siteId }/comments`,
			apiVersion: '1.1',
			query: {
				status,
				type,
			}
		}, action ) );
	}
};

const addComments = ( { dispatch }, { query: { siteId } }, next, { comments } ) => {
	const byPost = groupBy( comments, ( { post: { ID } } ) => ID );

	forEach( byPost, ( postComments, postId ) => dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: postComments,
	} ) );
};

const announceFailure = ( { dispatch } ) => dispatch( errorNotice( translate( 'Could not retrieve list of comments' ) ) );

export default {
	[ COMMENTS_LIST_REQUEST ]: [ dispatchRequest( fetchCommentsList, addComments, announceFailure ) ]
};
