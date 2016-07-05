/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { getPost } from 'state/posts/selectors';
import { savePost } from 'state/posts/actions';
import { canCurrentUser } from 'state/current-user/selectors';

function PostActionsEllipsisMenuPublish( { translate, status, siteId, postId, canPublish, dispatchSavePost } ) {
	if ( ! canPublish || ! includes( [ 'pending', 'draft' ], status ) ) {
		return null;
	}

	function publishPost() {
		if ( siteId && postId ) {
			dispatchSavePost( { status: 'publish' }, siteId, postId );
		}
	}

	return (
		<PopoverMenuItem onClick={ publishPost } icon="reader">
			{ translate( 'Publish' ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuPublish.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	status: PropTypes.string,
	siteId: PropTypes.number,
	postId: PropTypes.number,
	canPublish: PropTypes.bool,
	dispatchSavePost: PropTypes.func
};

export default connect(
	( state, ownProps ) => {
		const post = getPost( state, ownProps.globalId );
		if ( ! post ) {
			return {};
		}

		return {
			status: post.status,
			siteId: post.site_ID,
			postId: post.ID,
			canPublish: canCurrentUser( state, post.site_ID, 'publish_posts' )
		};
	},
	{ dispatchSavePost: savePost }
)( localize( PostActionsEllipsisMenuPublish ) );
