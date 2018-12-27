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
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { removeNotice, successNotice } from 'state/notices/actions';
import { restorePost } from 'state/posts/actions';
import { navigate } from 'state/ui/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import getPostTypeTrashUrl from 'state/selectors/get-post-type-trash-url';

export class PostTrashLink extends Component {
	state = {
		isTrashing: false,
	};

	componentDidUpdate( prevProps ) {
		const { postId, postStatus, siteId, translate, trashUrl } = this.props;

		if ( 'trash' !== prevProps.postStatus && 'trash' === postStatus ) {
			const noticeId = `trash_${ siteId }_${ postId }`;
			this.props.successNotice( translate( 'Post successfully moved to trash.' ), {
				button: translate( 'Undo' ),
				id: noticeId,
				isPersistent: true,
				onClick: () => {
					this.props.removeNotice( noticeId );
					this.props.restorePost( siteId, postId );
				},
			} );

			this.props.navigate( trashUrl );
		}
	}

	onClick = () => {
		const { postId, postType, trashPost } = this.props;
		trashPost( postId, postType );
		this.setState( { isTrashing: true } );
	};

	render() {
		const { isNew, postId } = this.props;
		const { isTrashing } = this.state;

		if ( isNew || ! postId ) {
			return null;
		}

		return (
			<Button
				className="editor-post-trash button-link-delete"
				disabled={ isTrashing }
				isBusy={ isTrashing }
				isDefault
				isLarge
				onClick={ this.onClick }
			>
				{ __( 'Move to trash' ) }
			</Button>
		);
	}
}

export default compose( [
	withSelect( select => {
		const {
			getCurrentPostId,
			getCurrentPostType,
			getEditedPostAttribute,
			isEditedPostNew,
		} = select( 'core/editor' );
		return {
			isNew: isEditedPostNew(),
			postId: getCurrentPostId(),
			postStatus: getEditedPostAttribute( 'status' ),
			postType: getCurrentPostType(),
		};
	} ),
	withDispatch( dispatch => ( {
		trashPost: dispatch( 'core/editor' ).trashPost,
	} ) ),
] )(
	connect(
		( state, { postType } ) => ( {
			siteId: getSelectedSiteId( state ),
			trashUrl: getPostTypeTrashUrl( state, postType ),
		} ),
		{
			navigate,
			removeNotice,
			restorePost,
			successNotice,
		}
	)( localize( PostTrashLink ) )
);
