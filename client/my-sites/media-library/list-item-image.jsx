/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { url as mediaUrl } from 'lib/media/utils';
import MediaLibraryListItemFileDetails from './list-item-file-details';

import { MEDIA_IMAGE_PHOTON, MEDIA_IMAGE_THUMBNAIL, SCALE_CHOICES } from 'lib/media/constants';

const scaleMultiplier = 1 / SCALE_CHOICES[ SCALE_CHOICES.length - 1 ];

export default class MediaLibraryListItemImage extends React.Component {
	static propTypes = {
		media: PropTypes.object,
		scale: PropTypes.number,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
	};

	static defaultProps = {
		maxImageWidth: 450,
		thumbnailType: MEDIA_IMAGE_PHOTON,
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

	setUnknownImageDimensions = event => {
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
		const url = mediaUrl( this.props.media, {
			photon: this.props.thumbnailType === MEDIA_IMAGE_PHOTON,
			maxWidth: Math.round( scaleMultiplier * this.state.maxSeenScale * this.props.maxImageWidth ),
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
			<img
				src={ url }
				onLoad={ this.setUnknownImageDimensions }
				alt={ this.props.media.alt || this.props.media.title }
				style={ this.getImageStyle() }
				className="media-library__list-item-centered"
				draggable="false"
			/>
		);
	}
}
