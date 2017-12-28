/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { head, uniqueId } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DropZone from 'client/components/drop-zone';
import MediaActions from 'client/lib/media/actions';
import MediaStore from 'client/lib/media/store';
import MediaUtils from 'client/lib/media/utils';
import PostActions from 'client/lib/posts/actions';
import FeaturedImageDropZoneIcon from './dropzone-icon';

import { receiveMedia, deleteMedia } from 'client/state/media/actions';
import { editPost } from 'client/state/posts/actions';
import { getSelectedSiteId, getSelectedSite } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { recordTracksEvent } from 'client/state/analytics/actions';

class FeaturedImageDropZone extends Component {
	onFilesDrop = files => {
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
		const { siteId, site } = this.props;

		const handleFeaturedImageUpload = () => {
			const media = MediaStore.get( siteId, transientMediaId );
			const isUploadInProgress = media && MediaUtils.isItemBeingUploaded( media );
			const isFailedUpload = ! media;

			if ( isFailedUpload ) {
				this.props.deleteMedia( siteId, transientMediaId );
			} else {
				this.props.receiveMedia( siteId, media );
			}

			/**
			 * File upload finished. No need to listen for changes anymore.
			 */
			if ( ! isUploadInProgress ) {
				MediaStore.off( 'change', handleFeaturedImageUpload );

				// Successful image upload.
				if ( media ) {
					this.props.recordTracksEvent( 'calypso_editor_featured_image_upload', {
						source: 'dropzone',
						type: 'dragdrop',
					} );
				}
			}

			/**
			 * TODO: Redux way. What's left: figure out how to properly use `editPost`
			 * and research if the whole FeaturedImage component has to be updated to
			 * work properly with Redux.
			 *
			 * Right now `PostActions.edit` seems to be the best way to approach the problem.
			 */
			// this.props.editPost( siteId, this.props.postId, { featured_image: media.ID } );

			// Cannot dispatch an action while in a dispatched action. Temporary(tm).
			setTimeout( () => {
				PostActions.edit( {
					featured_image: media.ID,
				} );
			}, 0 );
		};

		MediaStore.on( 'change', handleFeaturedImageUpload );

		MediaActions.add( site, {
			ID: transientMediaId,
			fileContents: droppedImage,
			fileName: droppedImage.name,
		} );
	};

	render() {
		return (
			<DropZone
				className="editor-featured-image__dropzone"
				dropZoneName="featuredImage"
				icon={ <FeaturedImageDropZoneIcon /> }
				textLabel={ this.props.translate( 'Set as Featured Image' ) }
				onFilesDrop={ this.onFilesDrop }
			/>
		);
	}
}

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		postId: getEditorPostId( state ),
		site: getSelectedSite( state ),
	} ),
	{
		editPost,
		deleteMedia,
		receiveMedia,
		recordTracksEvent,
	}
)( localize( FeaturedImageDropZone ) );
