/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { head, uniqueId } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DropZone from 'components/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import { filterItemsByMimePrefix, isItemBeingUploaded } from 'lib/media/utils';
import ImageSelectorDropZoneIcon from './dropzone-icon';

import { receiveMedia, deleteMedia } from 'state/media/actions';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';

class ImageSelectorDropZone extends Component {
	static propTypes = {
		deleteMedia: PropTypes.func,
		onDroppedImage: PropTypes.func,
		receiveMedia: PropTypes.func,
		site: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	onFilesDrop = ( files ) => {
		/**
		 * Filter files for `image` media prefix and return the first image.
		 *
		 * At the moment we ignore all the other images that were dragged onto the DropZone
		 */
		const droppedImage = head( filterItemsByMimePrefix( files, 'image' ) );

		if ( ! droppedImage ) {
			return false;
		}

		const transientMediaId = uniqueId( 'image-selector' );
		const { siteId, site } = this.props;

		const handleImageSelectorUpload = () => {
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
				MediaStore.off( 'change', handleImageSelectorUpload );
			}
			this.props.onDroppedImage( media );
		};

		MediaStore.on( 'change', handleImageSelectorUpload );

		MediaActions.add( site, {
			ID: transientMediaId,
			fileContents: droppedImage,
			fileName: droppedImage.name,
		} );
	};

	render() {
		return (
			<DropZone
				className="image-selector__dropzone"
				dropZoneName="imageSelector"
				icon={ <ImageSelectorDropZoneIcon /> }
				textLabel={ this.props.translate( 'Add Image' ) }
				onFilesDrop={ this.onFilesDrop }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;
		const props = {
			siteId: getSelectedSiteId( state ),
			site: getSelectedSite( state ),
		};
		if ( siteId ) {
			props.siteId = siteId;
			props.site = getSite( state, siteId );
		}
		return props;
	},
	{
		deleteMedia,
		receiveMedia,
	}
)( localize( ImageSelectorDropZone ) );
