import { Gridicon, ProgressBar, Spinner } from '@automattic/components';
import clsx from 'clsx';
import { isEqual } from 'lodash';
import * as React from 'react';
import { getMimePrefix } from 'calypso/lib/media/utils';
import ListItemAudio from './list-item-audio';
import ListItemDocument from './list-item-document';
import ListItemImage from './list-item-image';
import ListItemVideo from './list-item-video';

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
	selectedIndex?: number;
	onToggle?: ( media: Media | undefined, shiftKey: boolean ) => void;
	style?: React.CSSProperties;
}

interface State {
	uploadProgress: number;
}

type DivProps = Omit< React.ComponentPropsWithoutRef< 'button' >, 'style' | 'onClick' >;

export default class MediaLibraryListItem extends React.Component< Props & DivProps > {
	state = {
		uploadProgress: 0,
	};

	static defaultProps = {
		maxImageWidth: 450,
		selectedIndex: -1,
	};

	uploadEventListener = ( event: Event ) => {
		const detail = ( event as CustomEvent ).detail;
		if ( this.props.media && ( this.props.media as MediaObject ).file !== detail.fileName ) {
			return;
		}

		this.setState( {
			uploadProgress: detail.progress,
		} );
	};

	componentDidMount() {
		document.addEventListener( 'tus-upload-progress', this.uploadEventListener );
	}

	componentWillUnmount() {
		document.removeEventListener( 'tus-upload-progress', this.uploadEventListener );
	}

	shouldComponentUpdate( nextProps: Props, nextState: State ) {
		return ! (
			nextProps.media === this.props.media &&
			nextProps.scale === this.props.scale &&
			nextProps.maxImageWidth === this.props.maxImageWidth &&
			nextProps.thumbnailType === this.props.thumbnailType &&
			nextProps.selectedIndex === this.props.selectedIndex &&
			nextState.uploadProgress === this.state.uploadProgress &&
			isEqual( nextProps.style, this.props.style )
		);
	}

	clickItem = ( event: React.MouseEvent ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( this.props.media, event.shiftKey );
		}
	};

	renderItem() {
		let component;

		if ( ! this.props.media ) {
			return null;
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
	}

	render() {
		let dataAttributes = null;
		let title;
		let selectedNumber;

		const {
			media,
			scale,
			maxImageWidth,
			thumbnailType,
			selectedIndex,
			onToggle,
			style,
			...otherProps
		} = this.props;

		const { uploadProgress } = this.state;
		const isTransient = media && ( media as MediaObject ).transient;

		const classes = clsx( 'media-library__list-item', {
			'is-placeholder': ! media,
			'is-selected': -1 !== selectedIndex,
			'is-transient': isTransient,
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
					{ isTransient && (
						<>
							{ uploadProgress > 0 ? (
								<div className="media-library__list-item-progress">
									<ProgressBar value={ uploadProgress } />
								</div>
							) : (
								<div className="media-library__list-item-spinner">
									<Spinner />
								</div>
							) }
						</>
					) }
				</figure>
			</button>
		);
	}
}
