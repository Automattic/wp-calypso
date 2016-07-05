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
import { canCurrentUser } from 'state/current-user/selectors';

function PostActionsEllipsisMenuPublish( { translate, status, canPublish } ) {
	if ( ! canPublish || ! includes( [ 'pending', 'draft' ], status ) ) {
		return null;
	}

	function publishPost() {
		alert( 'Not Yet Implemented' );
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
	canPublish: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	return {
		status: post.status,
		canPublish: canCurrentUser( state, post.site_ID, 'publish_posts' )
	};
} )( localize( PostActionsEllipsisMenuPublish ) );
