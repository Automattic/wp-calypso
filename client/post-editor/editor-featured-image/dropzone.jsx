/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { head, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import DropZone from 'components/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import MediaUtils from 'lib/media/utils';
import PostActions from 'lib/posts/actions';

import { receiveMedia, deleteMedia } from 'state/media/actions';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';


class FeaturedImageDropZone extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		post: PropTypes.object.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object
	};

	onFilesDrop = ( files ) => {
		/**
		 * Filter files for `image` media prefix and return the first image.
		 *
		 * At the moment we ignore all the other images that were dragged onto the DropZone
		 */
		const droppedImage = head( MediaUtils.filterItemsByMimePrefix( files, 'image' ) );

		if ( ! droppedImage ) {
			return false;
		}

		const transientMediaId = uniqueId( 'featured-image' );
		const siteID = this.props.siteId;

		const handleFeaturedImageUpload = () => {
			const media = MediaStore.get( siteID, transientMediaId );
			const isUploadInProgress = media && MediaUtils.isItemBeingUploaded( media );
			const isFailedUpload = ! media;

			if ( isFailedUpload ) {
				this.props.deleteMedia( siteID, transientMediaId );
			} else {
				this.props.receiveMedia( siteID, media );
			}

			/**
			 * File uploaded successfully, there is no longer need to listen for the changes.
			 */
			if ( media && ! isUploadInProgress ) {
				MediaStore.off( 'change', handleFeaturedImageUpload );
			}

			/**
			 * TODO: Redux way. What's left: figure out how to properly use `editPost`
			 * and research if the whole FeaturedImage component has to be updated to
			 * work properly with Redux.
			 *
			 * Right now `PostActions.edit` seems to be the best way to approach the problem.
			 */
			// this.props.editPost( siteID, this.props.postId, { featured_image: media.ID } );

			// You cannot dispatch an action while in a dispatched action.
			setTimeout( () => {
				PostActions.edit( {
					featured_image: media.ID
				} );
			}, 0 );
		};

		MediaStore.on( 'change', handleFeaturedImageUpload );

		MediaActions.add( this.props.site.ID, {
			ID: transientMediaId,
			fileContents: droppedImage,
			fileName: droppedImage.name
		} );
	};

	render() {
		return (
			<DropZone onFilesDrop={ this.onFilesDrop } />
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return { siteId, postId };
	},
	{
		editPost,
		deleteMedia,
		receiveMedia
	}
)( FeaturedImageDropZone );
