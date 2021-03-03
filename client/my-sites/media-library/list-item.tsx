/**
 * External dependencies
 */
import { isEqual, noop } from 'lodash';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import Gridicon from 'calypso/components/gridicon';
import ListItemImage from './list-item-image';
import ListItemVideo from './list-item-video';
import ListItemAudio from './list-item-audio';
import ListItemDocument from './list-item-document';
import { getMimePrefix } from 'calypso/lib/media/utils';
import EditorMediaModalGalleryHelp from 'calypso/post-editor/media-modal/gallery-help';

/**
 * Style dependencies
 */
import './list-item.scss';

// TODO: move to lib/media/utils once it gets typed.
interface MediaObject {
	transient?: boolean;
	file?: string;
	[ propName: string ]: any;
}
type Media = string | MediaObject;
// END TODO

interface Props {
	media?: Media;
	scale: number;
	maxImageWidth?: number;
	thumbnailType?: string;
	showGalleryHelp?: boolean;
	selectedIndex?: number;
	onToggle?: ( media: Media | undefined, shiftKey: boolean ) => void;
	onEditItem?: any; // Unused. Appears to have been left here for compatibility reasons.
	style?: React.CSSProperties;
}

type DivProps = Omit< React.ComponentPropsWithoutRef< 'button' >, 'style' | 'onClick' >;

export default class MediaLibraryListItem extends React.Component< Props & DivProps > {
	static defaultProps = {
		maxImageWidth: 450,
		selectedIndex: -1,
		onToggle: noop,
		onEditItem: noop,
	};

	shouldComponentUpdate( nextProps: Props ) {
		return ! (
			nextProps.media === this.props.media &&
			nextProps.scale === this.props.scale &&
			nextProps.maxImageWidth === this.props.maxImageWidth &&
			nextProps.thumbnailType === this.props.thumbnailType &&
			nextProps.selectedIndex === this.props.selectedIndex &&
			isEqual( nextProps.style, this.props.style )
		);
	}

	clickItem = ( event: React.MouseEvent ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( this.props.media, event.shiftKey );
		}
	};

	renderItem = () => {
		let component;

		if ( ! this.props.media ) {
			return;
		}

		switch ( getMimePrefix( this.props.media ) as string ) {
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

	render() {
		let title;
		let selectedNumber;

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

		let dataAttributes = null;

		const classes = classNames( 'media-library__list-item', {
			'is-placeholder': ! media,
			'is-selected': -1 !== selectedIndex,
			'is-transient': media && ( media as MediaObject ).transient,
			'is-small': scale <= 0.125,
		} );

		const styleWithDefaults = { width: scale * 100 + '%', ...style };

		if ( media && ( media as MediaObject ).file ) {
			title = ( media as MediaObject ).file;
		}

		if ( selectedIndex !== -1 && selectedIndex !== undefined ) {
			selectedNumber = selectedIndex + 1;
			dataAttributes = { 'data-selected-number': selectedNumber > 99 ? '99+' : selectedNumber };
		}

		return (
			<button
				className={ classes }
				style={ styleWithDefaults }
				onClick={ this.clickItem }
				{ ...otherProps }
				{ ...dataAttributes }
			>
				<span className="media-library__list-item-selected-icon">
					<Gridicon icon="checkmark" size={ 18 } />
				</span>
				<figure className="media-library__list-item-figure" title={ title }>
					{ this.renderItem() }
					{ media && ( media as MediaObject ).transient && (
						<div className="media-library__list-item-spinner">
							<Spinner />
						</div>
					) }
					{ showGalleryHelp && <EditorMediaModalGalleryHelp /> }
				</figure>
			</button>
		);
	}
}
