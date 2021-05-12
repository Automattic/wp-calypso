/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import resize from 'calypso/lib/resize-image-url';
import ListItemFileDetails from './list-item-file-details';
import Gridicon from 'calypso/components/gridicon';
import { MEDIA_IMAGE_THUMBNAIL, SCALE_CHOICES } from 'calypso/lib/media/constants';

/**
 * Style dependencies
 */
import './list-item-video.scss';
import MediaFile from './media-file';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItemVideo';

	static propTypes = {
		media: PropTypes.object,
		scale: PropTypes.number,
		maxScale: PropTypes.number,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
	};

	static defaultProps = {
		maxImageWidth: 450,
		maxScale: SCALE_CHOICES[ SCALE_CHOICES.length - 1 ],
	};

	static getDerivedStateFromProps( props, state ) {
		const maxSeenScale = state.maxSeenScale || 0;
		return props.scale > maxSeenScale ? { maxSeenScale: props.scale } : null;
	}

	state = {};

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
			const width = Math.round(
				( 1 / this.props.maxScale ) * this.state.maxSeenScale * this.props.maxImageWidth
			);

			const url =
				this.props.thumbnailType === MEDIA_IMAGE_THUMBNAIL
					? thumbnail
					: resize( thumbnail, { resize: `${ width },${ width }` } );

			return <MediaFile src={ url } component={ ListItemVideo } placeholder={ ListItemVideo } />;
		}
		return <ListItemFileDetails { ...this.props } icon="video-camera" />;
	}
}

function ListItemVideo( { src } ) {
	const style = {};
	if ( src ) {
		style.backgroundImage = 'url(' + src + ')';
	}
	return (
		<div className="media-library__list-item-video" style={ style }>
			<span className="media-library__list-item-icon media-library__list-item-centered">
				<Gridicon icon="video-camera" />
			</span>
		</div>
	);
}
