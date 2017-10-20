/**
 * External dependencies
 *
 * @format
 */

import { translate } from 'i18n-calypso';
import { map, flatMap } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_TREE_SITE_ADD, COMMENTS_TREE_SITE_REQUEST } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getRawSite } from 'state/sites/selectors';

export const fetchCommentsTreeForSite = ( { dispatch }, action ) => {
	const { siteId, status = 'unapproved' } = action.query;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comments-tree`,
				apiVersion: '1.1',
				query: {
					status,
				},
			},
			action
		)
	);
};

const mapPosts = ( commentIds, postId ) => {
	postId = parseInt( postId, 10 );

	const topLevelComments = map( commentIds[ 0 ], commentId => [ commentId, postId, 0 ] );

	const commentReplies = commentIds[ 1 ]
		? map( commentIds[ 1 ], ( [ commentId, commentParentId ] ) => [
				commentId,
				postId,
				commentParentId,
			] )
		: [];

	return topLevelComments.concat( commentReplies );
};

const mapTree = ( tree, status, type ) => {
	return map( flatMap( tree, mapPosts ), ( [ commentId, postId, commentParentId ] ) => ( {
		commentId,
		commentParentId,
		postId,
		status,
		type,
	} ) );
};

export const addCommentsTree = ( { dispatch }, { query }, data ) => {
	const { siteId, status } = query;

	const tree = [
		...mapTree( data.comments_tree, status, 'comment' ),
		...mapTree( data.pingbacks_tree, status, 'pingback' ),
		...mapTree( data.trackbacks_tree, status, 'trackback' ),
	];

	dispatch( {
		type: COMMENTS_TREE_SITE_ADD,
		siteId,
		status,
		tree,
	} );
};

export const announceFailure = ( { dispatch, getState }, { query } ) => {
	const { siteId } = query;
	const site = getRawSite( getState(), siteId );

	const error =
		site && site.name
			? translate( 'Failed to retrieve comments for site “%(siteName)s”', {
					args: { siteName: site.name },
				} )
			: translate( 'Failed to retrieve comments for your site' );

	dispatch( errorNotice( error ) );
};

const treeHandlers = {
	[ COMMENTS_TREE_SITE_REQUEST ]: [
		dispatchRequest( fetchCommentsTreeForSite, addCommentsTree, announceFailure ),
	],
};

export default mergeHandlers( treeHandlers );
