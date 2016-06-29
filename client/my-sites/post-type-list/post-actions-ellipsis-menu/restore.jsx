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
import { getPost } from 'state/posts/selectors';
import { getCurrentUserId, canCurrentUser } from 'state/current-user/selectors';

function PostActionsEllipsisMenuRestore( { translate, canRestore, status } ) {
	if ( 'trash' !== status || ! canRestore ) {
		return null;
	}

	function restorePost() {
		alert( 'Not Yet Implemented' );
	}

	return (
		<PopoverMenuItem onClick={ restorePost } icon="undo">
			{ translate( 'Restore' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuRestore.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	canRestore: PropTypes.bool,
	status: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	const userId = getCurrentUserId( state );
	const isAuthor = post.author && post.author.ID === userId;

	return {
		status: post.status,
		canRestore: canCurrentUser( state, post.site_ID, isAuthor ? 'delete_posts' : 'delete_others_posts' )
	};
} )( localize( PostActionsEllipsisMenuRestore ) );
