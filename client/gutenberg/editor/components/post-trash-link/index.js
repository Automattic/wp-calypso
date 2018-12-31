/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { trashPost } from 'state/posts/actions';
import { navigate } from 'state/ui/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';

export class PostTrashLink extends Component {
	onClick = () => {
		const { postId, siteId, trashUrl } = this.props;
		this.props.trashPost( siteId, postId );
		this.props.navigate( trashUrl );
	};

	render() {
		const { isNew, postId } = this.props;

		if ( isNew || ! postId ) {
			return null;
		}

		return (
			<Button
				className="editor-post-trash button-link-delete"
				isDefault
				isLarge
				onClick={ this.onClick }
			>
				{ __( 'Move to trash' ) }
			</Button>
		);
	}
}

export default withSelect( select => {
	const { getCurrentPostId, getCurrentPostType, isEditedPostNew } = select( 'core/editor' );
	return {
		isNew: isEditedPostNew(),
		postId: getCurrentPostId(),
		postType: getCurrentPostType(),
	};
} )(
	connect(
		( state, { postType } ) => ( {
			siteId: getSelectedSiteId( state ),
			trashUrl: getPostTypeTrashUrl( state, postType ),
		} ),
		{
			navigate,
			trashPost,
		}
	)( localize( PostTrashLink ) )
);
