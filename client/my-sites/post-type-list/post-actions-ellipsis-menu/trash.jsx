/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { trashPost, deletePost } from 'state/posts/actions';
import { getPost } from 'state/posts/selectors';
import { getCurrentUserId, canCurrentUser } from 'state/current-user/selectors';

function PostActionsEllipsisMenuTrash( { translate, siteId, postId, status, canDelete, dispatch } ) {
	if ( ! canDelete ) {
		return null;
	}

	function onTrash() {
		if ( ! postId ) {
			return;
		}

		if ( 'trash' !== status ) {
			dispatch( trashPost( siteId, postId ) );
		} else if ( confirm( translate( 'Are you sure you want to permanently delete this post?' ) ) ) {
			dispatch( deletePost( siteId, postId ) );
		}
	}

	return (
		<PopoverMenuItem onClick={ onTrash } icon="trash">
			{ 'trash' === status
				? translate( 'Delete Permanently' )
				: translate( 'Trash', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuTrash.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	postId: PropTypes.number,
	siteId: PropTypes.number,
	status: PropTypes.string,
	canDelete: PropTypes.bool,
	dispatch: PropTypes.func
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	const userId = getCurrentUserId( state );
	const isAuthor = post.author && post.author.ID === userId;

	return {
		postId: post.ID,
		siteId: post.site_ID,
		status: post.status,
		canDelete: canCurrentUser( state, post.site_ID, isAuthor ? 'delete_posts' : 'delete_others_posts' )
	};
} )( localize( PostActionsEllipsisMenuTrash ) );
