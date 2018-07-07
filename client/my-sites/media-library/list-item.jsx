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
import ListItemFolder from './list-item-folder';
import { getMimePrefix } from 'lib/media/utils';
import EditorMediaModalGalleryHelp from 'post-editor/media-modal/gallery-help';
import { MEDIA_IMAGE_PHOTON } from 'lib/media/constants';

// Double click handling
let doubleClickPrevent = false;
let doubleClicktimer = 0;
const DOUBLE_CLICK_DELAY = 200;

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
		onEnter: PropTypes.func,
	};

	static defaultProps = {
		maxImageWidth: 450,
		thumbnailType: MEDIA_IMAGE_PHOTON,
		selectedIndex: -1,
		onToggle: noop,
		onEditItem: noop,
		onEnter: noop,
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

	toggleHandler = ( media, shiftKey ) => {
		this.props.onToggle( media, shiftKey );
	};

	clickItem = e => {
		// Avoid reusing reference to Synthetic event
		// https://reactjs.org/docs/events.html#event-pooling
		const synthEvent = Object.assign( {}, e );

		doubleClicktimer = setTimeout( () => {
			if ( ! doubleClickPrevent ) {
				this.toggleHandler( this.props.media, synthEvent.shiftKey );
			}
			doubleClickPrevent = false;
		}, DOUBLE_CLICK_DELAY );
	};

	doubleClickItem = () => {
		clearTimeout( doubleClicktimer );
		doubleClickPrevent = true;
		this.props.onEnter( this.props.media );
	};

	handleKeyPress = e => {
		// Avoid reusing reference to Synthetic event
		// https://reactjs.org/docs/events.html#event-pooling
		const synthEvent = Object.assign( {}, e );
		const isEnterKey = synthEvent.keyCode === 13;
		const isSpacebarKey = synthEvent.keyCode === 32;
		const isKeyboardActionKey = isEnterKey || isSpacebarKey;
		const targetHasFocus = document.activeElement && document.activeElement === synthEvent.target;
		const isShiftPressed = synthEvent.shiftKey;

		if ( isKeyboardActionKey && targetHasFocus ) {
			// Required because space or enter have default
			// functionality in browsers (eg: scroll down)
			e.preventDefault();

			if ( isShiftPressed ) {
				this.toggleHandler( this.props.media, synthEvent.shiftKey );
			} else {
				this.props.onEnter( this.props.media );
			}
		}
	};

	renderItem = () => {
		let component;

		if ( ! this.props.media ) {
			return;
		}

		if ( this.props.media.type === 'folder' ) {
			component = ListItemFolder;
		} else {
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

		const classes = classNames( 'media-library__list-item', {
			'is-placeholder': ! this.props.media,
			'is-selected': -1 !== this.props.selectedIndex,
			'is-transient': this.props.media && this.props.media.transient,
			'is-small': this.props.scale <= 0.125,
		} );

		const props = omit( this.props, Object.keys( this.constructor.propTypes ) );

		const style = assign(
			{
				width: this.props.scale * 100 + '%',
			},
			this.props.style
		);

		if ( this.props.media ) {
			title = this.props.media.file;
		}

		if ( -1 !== this.props.selectedIndex ) {
			selectedNumber = this.props.selectedIndex + 1;
			props[ 'data-selected-number' ] = selectedNumber > 99 ? '99+' : selectedNumber;
		}

		return (
			<div
				className={ classes }
				style={ style }
				onClick={ this.clickItem }
				onDoubleClick={ this.doubleClickItem }
				onKeyDown={ this.handleKeyPress }
				tabIndex="0" // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
				{ ...props }
				role="button"
				aria-pressed={ -1 !== this.props.selectedIndex }
			>
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
