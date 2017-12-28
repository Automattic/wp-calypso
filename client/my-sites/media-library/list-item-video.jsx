/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import photon from 'photon';

/**
 * Internal dependencies
 */
import ListItemFileDetails from './list-item-file-details';
import Gridicon from 'gridicons';

import { MEDIA_IMAGE_THUMBNAIL, MEDIA_IMAGE_PHOTON } from 'client/lib/media/constants';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItemVideo';

	static propTypes = {
		media: PropTypes.object,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
	};

	static defaultProps = {
		maxImageWidth: 450,
		thumbnailType: MEDIA_IMAGE_PHOTON,
	};

	getHighestQualityThumbnail = () => {
		if ( this.props.media.thumbnails ) {
			return (
				this.props.media.thumbnails.fmt_hd ||
				this.props.media.thumbnails.fmt_dvd ||
				this.props.media.thumbnails.fmt_std
			);
		}
	};

	render() {
		const thumbnail = this.getHighestQualityThumbnail();

		if ( thumbnail ) {
			// Non MEDIA_IMAGE_THUMBNAIL video media is accessible via Photon
			const url =
				this.props.thumbnailType === MEDIA_IMAGE_THUMBNAIL
					? thumbnail
					: photon( thumbnail, { width: this.props.maxImageWidth } );

			return (
				<div
					className="media-library__list-item-video"
					style={ { backgroundImage: 'url(' + url + ')' } }
				>
					<span className="media-library__list-item-icon media-library__list-item-centered">
						<Gridicon icon="video-camera" />
					</span>
				</div>
			);
		} else {
			return <ListItemFileDetails { ...this.props } icon="video-camera" />;
		}
	}
}
