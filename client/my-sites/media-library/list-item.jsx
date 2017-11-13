/** @format */

/**
 * External dependencies
 */

import { assign, isEqual, noop, omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';
import Gridicon from 'gridicons';
import ListItemImage from './list-item-image';
import ListItemVideo from './list-item-video';
import ListItemAudio from './list-item-audio';
import ListItemDocument from './list-item-document';
import MediaUtils from 'lib/media/utils';
import EditorMediaModalGalleryHelp from 'post-editor/media-modal/gallery-help';
import { MEDIA_IMAGE_PHOTON } from 'lib/media/constants';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItem';

	static propTypes = {
		media: PropTypes.object,
		scale: PropTypes.number.isRequired,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
		showGalleryHelp: PropTypes.bool,
		selectedIndex: PropTypes.number,
		onToggle: PropTypes.func,
		onEditItem: PropTypes.func,
		style: PropTypes.object,
	};

	static defaultProps = {
		maxImageWidth: 450,
		thumbnailType: MEDIA_IMAGE_PHOTON,
		selectedIndex: -1,
		onToggle: noop,
		onEditItem: noop,
	};

	shouldComponentUpdate( nextProps ) {
		return ! (
			nextProps.media === this.props.media &&
			nextProps.scale === this.props.scale &&
			nextProps.maxImageWidth === this.props.maxImageWidth &&
			nextProps.thumbnailType === this.props.thumbnailType &&
			nextProps.selectedIndex === this.props.selectedIndex &&
			isEqual( nextProps.style, this.props.style )
		);
	}

	clickItem = event => {
		this.props.onToggle( this.props.media, event.shiftKey );
	};

	renderItem = () => {
		var component;

		if ( ! this.props.media ) {
			return;
		}

		switch ( MediaUtils.getMimePrefix( this.props.media ) ) {
			case 'image':
				component = ListItemImage;
				break;
			case 'video':
				component = ListItemVideo;
				break;
			case 'audio':
				component = ListItemAudio;
				break;
			default:
				component = ListItemDocument;
				break;
		}

		return React.createElement( component, this.props );
	};

	renderSpinner = () => {
		if ( ! this.props.media || ! this.props.media.transient ) {
			return;
		}

		return <Spinner className="media-library__list-item-spinner" />;
	};

	render() {
		var classes, props, style, title;

		classes = classNames( 'media-library__list-item', {
			'is-placeholder': ! this.props.media,
			'is-selected': -1 !== this.props.selectedIndex,
			'is-transient': this.props.media && this.props.media.transient,
			'is-small': this.props.scale <= 0.125,
		} );

		props = omit( this.props, Object.keys( this.constructor.propTypes ) );

		style = assign(
			{
				width: this.props.scale * 100 + '%',
			},
			this.props.style
		);

		if ( this.props.media ) {
			title = this.props.media.file;
		}

		if ( -1 !== this.props.selectedIndex ) {
			props[ 'data-selected-number' ] = this.props.selectedIndex + 1;
		}

		return (
			<div className={ classes } style={ style } onClick={ this.clickItem } { ...props }>
				<span className="media-library__list-item-selected-icon">
					<Gridicon icon="checkmark" size={ 20 } />
				</span>
				<figure className="media-library__list-item-figure" title={ title }>
					{ this.renderItem() }
					{ this.renderSpinner() }
					{ this.props.showGalleryHelp && <EditorMediaModalGalleryHelp /> }
				</figure>
			</div>
		);
	}
}
