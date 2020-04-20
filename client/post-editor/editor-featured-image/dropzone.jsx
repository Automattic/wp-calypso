/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { head, uniqueId } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import DropZone from 'components/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import { filterItemsByMimePrefix, isItemBeingUploaded } from 'lib/media/utils';
import FeaturedImageDropZoneIcon from './dropzone-icon';

import { receiveMedia, deleteMedia } from 'state/media/actions';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { userCan } from 'lib/site/utils';

class FeaturedImageDropZone extends Component {
	onFilesDrop = ( files ) => {
		if ( ! this.props.site || ! userCan( 'upload_files', this.props.site ) ) {
			return false;
		}

		/**
		 * Filter files for `image` media prefix and return the first image.
		 *
		 * At the moment we ignore all the other images that were dragged onto the DropZone
		 */
		const droppedImage = head( filterItemsByMimePrefix( files, 'image' ) );

		if ( ! droppedImage ) {
			return false;
		}

		const transientMediaId = uniqueId( 'featured-image' );
		const { siteId, site } = this.props;

		const handleFeaturedImageUpload = () => {
			const media = MediaStore.get( siteId, transientMediaId );
			const isUploadInProgress = media && isItemBeingUploaded( media );
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

			this.props.editPost( siteId, this.props.postId, { featured_image: media.ID } );
		};

		MediaStore.on( 'change', handleFeaturedImageUpload );

		MediaActions.add( site, {
			ID: transientMediaId,
			fileContents: droppedImage,
			fileName: droppedImage.name,
		} );
	};

	render() {
		const { site, translate } = this.props;
		const canUploadFiles = userCan( 'upload_files', site );
		const textLabel = canUploadFiles
			? translate( 'Set as Featured Image' )
			: translate( 'You are not authorized to upload files to this site' );
		const icon = canUploadFiles ? <FeaturedImageDropZoneIcon /> : <Gridicon icon="cross" />;
		return (
			<DropZone
				className="editor-featured-image__dropzone"
				dropZoneName="featuredImage"
				icon={ icon }
				textLabel={ textLabel }
				onFilesDrop={ this.onFilesDrop }
			/>
		);
	}
}

export default connect(
	( state ) => ( {
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
