/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaUtils from 'client/lib/media/utils';
import MediaLibraryListItemFileDetails from './list-item-file-details';

import { MEDIA_IMAGE_PHOTON, MEDIA_IMAGE_THUMBNAIL } from 'client/lib/media/constants';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItemImage';

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

	state = {};

	getImageDimensions = () => {
		var width, height;

		if ( this.props.media.width ) {
			width = this.props.media.width;
		} else {
			width = this.state.imageWidth;
		}

		if ( this.props.media.height ) {
			height = this.props.media.height;
		} else {
			height = this.state.imageHeight;
		}

		return {
			width: width,
			height: height,
		};
	};

	getImageStyle = () => {
		var dimensions = this.getImageDimensions();

		return {
			maxHeight: dimensions.height > dimensions.width ? 'none' : '100%',
			maxWidth: dimensions.height < dimensions.width ? 'none' : '100%',
		};
	};

	setUnknownImageDimensions = event => {
		if ( ! this.props.media.width ) {
			this.setState( {
				imageWidth: event.target.clientWidth,
			} );
		}

		if ( ! this.props.media.height ) {
			this.setState( {
				imageHeight: event.target.clientHeight,
			} );
		}
	};

	render() {
		var url = MediaUtils.url( this.props.media, {
			photon: this.props.thumbnailType === MEDIA_IMAGE_PHOTON,
			maxWidth: this.props.maxImageWidth,
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
