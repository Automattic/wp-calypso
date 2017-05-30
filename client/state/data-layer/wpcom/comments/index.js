/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	COMMENTS_REQUEST,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/replies/
export const fetchPostComments = ( { dispatch }, action ) => {
	const { siteId, postId, query } = action;

	dispatch( http( {
		method: 'GET',
		path: `/sites/${ siteId }/posts/${ postId }/replies`,
		apiVersion: '1.1',
		query
	}, action ) );
};

export const addComments = ( { dispatch }, { siteId, postId }, next, { comments, found } ) => {
	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments
	} );

	// if the api have returned comments count, dispatch it
	// the api will produce a count only when the request has no
	// query modifiers such as 'before', 'after', 'type' and more.
	// in our case it'll be only on the first request
	if ( found > -1 ) {
		dispatch( {
			type: COMMENTS_COUNT_RECEIVE,
			siteId,
			postId,
			totalCommentsCount: found
		} );
	}
};

export const announceFailure = ( { dispatch, getState }, { siteId, postId } ) => {
	const post = getSitePost( getState(), siteId, postId );
	const postTitle = post && post.title && post.title.trim().slice( 0, 20 ).trim().concat( '…' );
	const error = postTitle
		? translate( 'Could not retrieve comments for “%(postTitle)s”', { args: { postTitle } } )
		: translate( 'Could not retrieve comments for requested post' );

	dispatch( errorNotice( error ) );
};

export default {
	[ COMMENTS_REQUEST ]: [ dispatchRequest( fetchPostComments, addComments, announceFailure ) ]
};
