/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEqual, uniq } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ImagePreloader from 'components/image-preloader';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import Spinner from 'components/spinner';
import { url } from 'lib/media/utils';

export class ImageSelectorPreview extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		itemIds: PropTypes.array,
		multiple: PropTypes.bool,
		maxWidth: PropTypes.number,
		onImageChange: PropTypes.func,
		showEditIcon: PropTypes.bool,
		translate: PropTypes.func,
	};

	state = {
		images: [],
		transientImages: {},
	};

	componentDidMount() {
		this.fetchImages();
		MediaStore.on( 'change', this.updateImageState );
	}

	componentDidUpdate( prevProps ) {
		const { siteId, itemIds } = this.props;
		if ( siteId !== prevProps.siteId || itemIds !== prevProps.itemIds ) {
			this.fetchImages();
		}
	}

	componentWillUnmount() {
		MediaStore.off( 'change', this.updateImageState );
	}

	setTransientImages = () => {
		const newTransientImages = {};
		this.state.images.forEach( ( image ) => {
			if ( image.transient ) {
				const media = MediaStore.get( this.props.siteId, image.ID );
				newTransientImages[ media.ID ] = image.URL;
			}
		} );
		this.setState( { transientImages: { ...this.state.transientImages, ...newTransientImages } } );
	};

	fetchImages = () => {
		// We may not necessarily need to trigger a network request if we
		// already have the data for the media item, so first update the state
		this.updateImageState( () => {
			const { itemIds, siteId } = this.props;
			if (
				isEqual(
					this.state.images.map( ( image ) => image.ID ),
					itemIds
				)
			) {
				return;
			}

			itemIds.map( ( id ) => {
				id = parseInt( id, 10 );
				const media = MediaStore.get( siteId, id );
				if ( ! media ) {
					MediaActions.fetch( siteId, id );
				}
			} );
		} );
	};

	updateImageState = ( callback ) => {
		const { itemIds, onImageChange, siteId } = this.props;
		this.setTransientImages();
		const images = uniq(
			itemIds
				.map( ( id ) => {
					return MediaStore.get( siteId, id );
				} )
				.filter( function ( e ) {
					return e;
				} )
		);

		this.setState( { images }, () => {
			if ( 'function' === typeof callback ) {
				callback();
			}
		} );

		const imageIds = images.map( ( image ) => image.ID );
		if (
			onImageChange &&
			images &&
			images.length === itemIds.length &&
			! isEqual( imageIds, itemIds )
		) {
			onImageChange( images );
		}
	};

	src = ( image ) => {
		return url( image, {
			maxWidth: this.props.maxWidth,
			size: 'post-thumbnail',
		} );
	};

	renderPlaceholder = ( ID ) => {
		let placeholder = <Spinner />;
		if ( this.state.transientImages[ ID ] ) {
			placeholder = <img src={ this.state.transientImages[ ID ] } alt="placeholder" />;
		}
		return placeholder;
	};

	renderUploaded = ( { URL, ID } ) => {
		return (
			<figure>
				<ImagePreloader
					src={ URL }
					placeholder={ this.renderPlaceholder( ID ) }
					draggable="false"
				/>
			</figure>
		);
	};

	renderImage = ( image ) => {
		const src = this.src( image );
		const { onImageClick, onRemoveImage, showEditIcon, translate } = this.props;
		const id = image.ID || image.transientId;

		const removeImage = () => {
			onRemoveImage( image );
		};

		const classes = classNames( 'image-selector__item', {
			'is-transient': image.transient || ! src,
			preview: null === src,
		} );

		return (
			<div className={ classes } key={ id }>
				<Button
					className="image-selector__image"
					onClick={ onImageClick }
					borderless
					compact
					data-tip-target="image-selector-image"
				>
					<Spinner />
					{ src ? this.renderUploaded( image ) : <span /> }
					{ showEditIcon && <Gridicon icon="pencil" className="image-selector__edit-icon" /> }
				</Button>
				<Button
					onClick={ removeImage }
					compact
					aria-label={ translate( 'Remove image' ) }
					className="image-selector__remove"
				>
					<Gridicon icon="cross-small" size={ 24 } className="image-selector__remove-icon" />
				</Button>
			</div>
		);
	};

	renderUploadPlaceholder() {
		const { onImageClick, translate, compact, multiple } = this.props;

		const classes = classNames( 'image-selector__uploader-wrapper', {
			compact,
		} );

		const addString = multiple ? translate( 'Add Images' ) : translate( 'Add Image' );
		const iconSize = compact ? 24 : 36;

		return (
			<Button
				className={ classes }
				onClick={ onImageClick }
				borderless
				compact
				data-tip-target="image-selector-image"
			>
				<div className="image-selector__uploader-picker">
					<div className="image-selector__uploader-label">
						<div>
							<Gridicon icon="add-image" size={ iconSize } />
							<p>{ ! compact && addString }</p>
						</div>
					</div>
				</div>
			</Button>
		);
	}

	render() {
		const images = [ ...this.state.images ];
		const featuredImage = ( images && images.shift() ) || null;

		const classes = classNames( 'image-selector__images-wrapper', this.props.className, {
			'is-assigned-featured': featuredImage,
		} );

		return (
			<div className={ classes }>
				<div className="image-selector__images">
					<div className="image-selector__images-featured">
						{ featuredImage && this.renderImage( featuredImage ) }
						{ ! featuredImage && this.renderUploadPlaceholder() }
					</div>
					<div className="image-selector__images-thumbs">
						{ images && images.map( ( image ) => this.renderImage( image ) ) }
						{ featuredImage && this.props.multiple && this.renderUploadPlaceholder() }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( ImageSelectorPreview );
