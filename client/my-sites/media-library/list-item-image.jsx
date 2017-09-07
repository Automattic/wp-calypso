/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var MediaUtils = require( 'lib/media/utils' ),
	MediaLibraryListItemFileDetails = require( './list-item-file-details' );

import { MEDIA_IMAGE_PHOTON, MEDIA_IMAGE_THUMBNAIL } from 'lib/media/constants';

module.exports = React.createClass( {
	displayName: 'MediaLibraryListItemImage',

	propTypes: {
		media: React.PropTypes.object,
		scale: React.PropTypes.number,
		maxImageWidth: React.PropTypes.number,
		thumbnailType: React.PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			maxImageWidth: 450,
			thumbnailType: MEDIA_IMAGE_PHOTON,
		};
	},

	getInitialState: function() {
		return {};
	},

	getImageDimensions: function() {
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
			height: height
		};
	},

	getImageStyle: function() {
		var dimensions = this.getImageDimensions();

		return {
			maxHeight: dimensions.height > dimensions.width ? 'none' : '100%',
			maxWidth: dimensions.height < dimensions.width ? 'none' : '100%'
		};
	},

	setUnknownImageDimensions: function( event ) {
		if ( ! this.props.media.width ) {
			this.setState( {
				imageWidth: event.target.clientWidth
			} );
		}

		if ( ! this.props.media.height ) {
			this.setState( {
				imageHeight: event.target.clientHeight
			} );
		}
	},

	render: function() {
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
					icon="image" />
			);
		}

		return (
			<img
				src={ url }
				onLoad={ this.setUnknownImageDimensions }
				alt={ this.props.media.alt || this.props.media.title }
				style={ this.getImageStyle() }
				className="media-library__list-item-centered"
				draggable="false" />
		);
	}
} );
