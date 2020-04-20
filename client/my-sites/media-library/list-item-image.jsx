/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { url as mediaUrl } from 'lib/media/utils';
import MediaLibraryListItemFileDetails from './list-item-file-details';
import MediaImage from './media-image';
import { MEDIA_IMAGE_THUMBNAIL, SCALE_CHOICES } from 'lib/media/constants';

export default class MediaLibraryListItemImage extends React.Component {
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

	getImageDimensions = () => {
		const width = this.props.media.width || this.state.imageWidth;
		const height = this.props.media.height || this.state.imageHeight;

		return { width, height };
	};

	getImageStyle = () => {
		const dimensions = this.getImageDimensions();

		return {
			maxHeight: dimensions.height > dimensions.width ? 'none' : '100%',
			maxWidth: dimensions.height < dimensions.width ? 'none' : '100%',
		};
	};

	setUnknownImageDimensions = ( event ) => {
		let newState = null;

		if ( ! this.props.media.width ) {
			newState = {
				imageWidth: event.target.clientWidth,
			};
		}

		if ( ! this.props.media.height ) {
			newState = newState || {};
			newState.imageHeight = event.target.clientHeight;
		}

		if ( newState ) {
			this.setState( newState );
		}
	};

	render() {
		const width = Math.round(
			( 1 / this.props.maxScale ) * this.state.maxSeenScale * this.props.maxImageWidth
		);

		const url = mediaUrl( this.props.media, {
			resize: `${ width },${ width }`,
			size: this.props.thumbnailType === MEDIA_IMAGE_THUMBNAIL ? 'medium' : false,
		} );

		if ( ! url ) {
			return (
				<MediaLibraryListItemFileDetails
					scale={ this.props.scale }
					media={ this.props.media }
					icon="image"
				/>
			);
		}

		return (
			<MediaImage
				src={ url }
				onLoad={ this.setUnknownImageDimensions }
				alt={ this.props.media.alt || this.props.media.title }
				style={ this.getImageStyle() }
				className="media-library__list-item-centered is-image"
				draggable="false"
			/>
		);
	}
}
