/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_RECEIVE,
	COMMENTS_TREE_SITE_ADD,
	COMMENTS_TREE_SITE_REQUEST,
	COMMENTS_TREE_JETPACK_SITE_REQUEST,
} from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getRawSite } from 'state/sites/selectors';

const fetchCommentsTreeForSite = ( { dispatch }, action ) => {
	const { siteId, status = 'unapproved' } = action.query;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comments-tree`,
				apiNamespace: 'wpcom/v2',
				query: {
					status: ( 'unapproved' === status ) ? 'pending' : status,
				},
			},
			action
		)
	);
};

const addCommentsTree = ( { dispatch }, { query }, next, data ) => {
	const { siteId, status } = query;
	const commentsTree = data[ 1 ];

	const tree = map( commentsTree, comment => ( {
		commentId: comment[ 0 ],
		postId: comment[ 1 ],
		commentParentId: comment[ 2 ],
		status,
	} ) );

	dispatch( {
		type: COMMENTS_TREE_SITE_ADD,
		siteId,
		status,
		tree,
	} );
};

const announceFailure = ( { dispatch, getState }, { query } ) => {
	const { siteId } = query;
	const site = getRawSite( getState(), siteId );

	const error = site && site.name
		? translate( 'Failed to retrieve comments for site “%(siteName)s”', {
			args: { siteName: site.name },
		} )
		: translate( 'Failed to retrieve comments for your site' );

	dispatch( errorNotice( error ) );
};

const fetchCommentsTreeForJetpackSites = ( { dispatch }, action ) => {
	const { page, siteId, status } = action.query;
	const query = {
		fields: 'ID,parent,post,status',
		number: 81,
		offset: ( page - 1 ) * 20, // see CommentList COMMENTS_PER_PAGE constant
		siteId,
		status,
		type: 'comment',
	};

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comments`,
				apiVersion: '1.1',
				query,
			},
			action
		)
	);
};

const addCommentsToJetpackTree = ( { dispatch }, { query }, next, { comments } ) => {
	const { siteId, status, strategy } = query;

	if ( 'add' === strategy ) {
		dispatch( {
			type: COMMENTS_RECEIVE,
			siteId,
			comments,
		} );
		return;
	}

	const tree = map( comments, comment => ( {
		commentId: get( comment, 'ID' ),
		postId: get( comment, 'post.ID' ),
		commentParentId: get( comment, 'parent.ID', 0 ),
		status,
	} ) );

	dispatch( {
		type: COMMENTS_TREE_SITE_ADD,
		siteId,
		status,
		tree,
	} );
};

const treeHandlers = {
	[ COMMENTS_TREE_SITE_REQUEST ]: [ dispatchRequest( fetchCommentsTreeForSite, addCommentsTree, announceFailure ) ],
	[ COMMENTS_TREE_JETPACK_SITE_REQUEST ]: [ dispatchRequest(
		fetchCommentsTreeForJetpackSites, addCommentsToJetpackTree, announceFailure
	) ],
};

export default mergeHandlers( treeHandlers );
