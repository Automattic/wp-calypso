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

function PostActionsEllipsisMenuView( { translate, status } ) {
	if ( 'trash' === status ) {
		return null;
	}

	function viewPost() {
		alert( 'Not Yet Implemented' );
	}

	return (
		<PopoverMenuItem onClick={ viewPost } icon="external">
			{ translate( 'View', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuView.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	status: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );
	if ( ! post ) {
		return {};
	}

	return {
		status: post.status
	};
} )( localize( PostActionsEllipsisMenuView ) );
