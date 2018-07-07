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
import Gridicon from 'gridicons';
import Count from 'components/count';
import { MEDIA_IMAGE_PHOTON, MEDIA_IMAGE_THUMBNAIL } from 'lib/media/constants';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItemFolder';

	static propTypes = {
		media: PropTypes.object,
		scale: PropTypes.number,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
	};

	static defaultProps = {
		icon: 'folder',
		maxImageWidth: 450,
		thumbnailType: MEDIA_IMAGE_PHOTON,
	};

	state = {};

	getImageDimensions = () => {
		let width, height;

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
		const dimensions = this.getImageDimensions();

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
		const url = mediaUrl( this.props.media, {
			photon: this.props.thumbnailType === MEDIA_IMAGE_PHOTON,
			maxWidth: this.props.maxImageWidth,
			size: this.props.thumbnailType === MEDIA_IMAGE_THUMBNAIL ? 'medium' : false,
		} );

		return (
			<div className="media-library__list-item-folder">
				<div className="media-library__list-item-folder-thumbnail">
					<img
						src={ url }
						onLoad={ this.setUnknownImageDimensions }
						alt={ this.props.media.alt || this.props.media.title }
						style={ this.getImageStyle() }
					/>
					<Gridicon size={ 124 * ( 1 - this.props.scale ) } icon="image-multiple" />
				</div>
				<div
					className="media-library__list-item-folder-name"
					style={ { fontSize: 10 * ( 1 + this.props.scale ) } }
				>
					{ this.props.scale >= 0.2 && (
						<Gridicon className="media-library__list-item-name-icon" icon={ this.props.icon } />
					) }

					<figcaption className="media-library__list-item-folder-name-text">
						{ this.props.media.name }
					</figcaption>
				</div>

				{ this.props.media.children && (
					<Count
						className="media-library__list-item-folder-count count"
						count={ this.props.media.children }
					/>
				) }
			</div>
		);
	}
}
