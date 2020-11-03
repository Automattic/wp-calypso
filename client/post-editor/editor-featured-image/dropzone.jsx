/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { head } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import DropZone from 'calypso/components/drop-zone';
import { filterItemsByMimePrefix, createTransientMediaId } from 'calypso/lib/media/utils';
import FeaturedImageDropZoneIcon from './dropzone-icon';

import { addMedia } from 'calypso/state/media/thunks';
import { editPost } from 'calypso/state/posts/actions';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { userCan } from 'calypso/lib/site/utils';

class FeaturedImageDropZone extends Component {
	onFilesDrop = async ( files ) => {
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

		const transientId = createTransientMediaId( 'featured-image' );

		const file = {
			ID: transientId,
			fileContents: droppedImage,
			fileName: droppedImage.name,
		};
		const promise = this.props.addMedia( file, this.props.site );

		// set the transient item as the featured image so that there isn't a delay while uploading
		this.props.editPost( this.props.siteId, this.props.postId, {
			featured_image: transientId,
		} );

		const { ID: savedMediaId } = await promise;

		this.props.recordTracksEvent( 'calypso_editor_featured_image_upload', {
			source: 'dropzone',
			type: 'dragdrop',
		} );

		// update it again to the saved media ID
		this.props.editPost( this.props.siteId, this.props.postId, {
			featured_image: savedMediaId,
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
		addMedia,
		recordTracksEvent,
	}
)( localize( FeaturedImageDropZone ) );
