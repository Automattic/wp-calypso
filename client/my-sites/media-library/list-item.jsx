/**
 * External dependencies
 */
import { isEqual, noop } from 'lodash';
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
import { getMimePrefix } from 'lib/media/utils';
import EditorMediaModalGalleryHelp from 'post-editor/media-modal/gallery-help';
/**
 * Style dependencies
 */
import './list-item.scss';

export default class MediaLibraryListItem extends React.Component {
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
		let component;

		if ( ! this.props.media ) {
			return;
		}

		switch ( getMimePrefix( this.props.media ) ) {
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

		return (
			<div className="media-library__list-item-spinner">
				<Spinner />
			</div>
		);
	};

	render() {
		let title, selectedNumber;

		const {
			media,
			scale,
			maxImageWidth,
			thumbnailType,
			showGalleryHelp,
			selectedIndex,
			onToggle,
			onEditItem,
			style,
			...otherProps
		} = this.props;

		const classes = classNames( 'media-library__list-item', {
			'is-placeholder': ! media,
			'is-selected': -1 !== selectedIndex,
			'is-transient': media && media.transient,
			'is-small': scale <= 0.125,
		} );

		const styleWithDefaults = { width: scale * 100 + '%', ...style };

		if ( media ) {
			title = media.file;
		}

		if ( -1 !== selectedIndex ) {
			selectedNumber = selectedIndex + 1;
			otherProps[ 'data-selected-number' ] = selectedNumber > 99 ? '99+' : selectedNumber;
		}

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
			<div
				className={ classes }
				style={ styleWithDefaults }
				onClick={ this.clickItem }
				{ ...otherProps }
			>
				<span className="media-library__list-item-selected-icon">
					<Gridicon icon="checkmark" size={ 18 } />
				</span>
				<figure className="media-library__list-item-figure" title={ title }>
					{ this.renderItem() }
					{ this.renderSpinner() }
					{ showGalleryHelp && <EditorMediaModalGalleryHelp /> }
				</figure>
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		);
	}
}
