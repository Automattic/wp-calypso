/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import photon from 'photon';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ListItemFileDetails from './list-item-file-details';
import { MEDIA_IMAGE_THUMBNAIL, MEDIA_IMAGE_PHOTON } from 'lib/media/constants';

export default React.createClass( {
	displayName: 'MediaLibraryListItemVideo',

	propTypes: {
		media: PropTypes.object,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			maxImageWidth: 450,
			thumbnailType: MEDIA_IMAGE_PHOTON,
		};
	},

	getHighestQualityThumbnail: function() {
		if ( this.props.media.thumbnails ) {
			return this.props.media.thumbnails.fmt_hd ||
				this.props.media.thumbnails.fmt_dvd ||
				this.props.media.thumbnails.fmt_std;
		}
	},

	render: function() {
		const thumbnail = this.getHighestQualityThumbnail();

		if ( thumbnail ) {
			// Non MEDIA_IMAGE_THUMBNAIL video media is accessible via Photon
			const url = this.props.thumbnailType === MEDIA_IMAGE_THUMBNAIL
							? thumbnail
							: photon( thumbnail, { width: this.props.maxImageWidth } );

			return (
				<div className="media-library__list-item-video" style={ { backgroundImage: 'url(' + url + ')' } }>
					<span className="media-library__list-item-icon media-library__list-item-centered">
						<Gridicon icon="video-camera" />
					</span>
				</div>
			);
		} else {
			return <ListItemFileDetails { ...this.props } icon="video-camera" />;
		}
	}
} );
