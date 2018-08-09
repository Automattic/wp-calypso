/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { defer, isEqual, uniq } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ImagePreloader from 'components/image-preloader';
import { localize } from 'i18n-calypso';
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

	fetchImages = () => {
		// We may not necessarily need to trigger a network request if we
		// already have the data for the media item, so first update the state
		this.updateImageState( () => {
			const { itemIds, siteId } = this.props;
			if ( isEqual( this.state.images.map( image => image.ID ), itemIds ) ) {
				return;
			}

			defer( () => {
				itemIds.map( id => {
					id = parseInt( id, 10 );
					const media = MediaStore.get( siteId, id );
					if ( ! media ) {
						MediaActions.fetch( siteId, id );
					}
				} );
			} );
		} );
	};

	updateImageState = callback => {
		const { itemIds, onImageChange, siteId } = this.props;
		const images = uniq(
			itemIds
				.map( id => {
					return MediaStore.get( siteId, id );
				} )
				.filter( function( e ) {
					return e;
				} )
		);

		this.setState( { images }, () => {
			if ( 'function' === typeof callback ) {
				callback();
			}
		} );
		defer( () => {
			const imageIds = images.map( image => image.ID );
			if (
				onImageChange &&
				images &&
				images.length === itemIds.length &&
				! isEqual( imageIds, itemIds )
			) {
				onImageChange( images );
			}
		} );
	};

	src = image => {
		return url( image, {
			maxWidth: this.props.maxWidth,
			size: 'post-thumbnail',
		} );
	};

	renderPlaceholder = image => {
		const { placeholder } = image;
		return (
			<figure>
				<img src={ placeholder || '' } alt="" />
			</figure>
		);
	};

	renderUploaded = ( { URL, placeholder } ) => {
		return (
			<figure>
				<ImagePreloader
					src={ URL }
					placeholder={ placeholder ? <img src={ placeholder } alt="" /> : <span /> }
				/>
			</figure>
		);
	};

	renderImage = image => {
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
					{ src ? this.renderUploaded( image ) : this.renderPlaceholder( image ) }
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

		const addString = multiple ? translate( 'Add images' ) : translate( 'Add image' );
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
						{ images && images.map( image => this.renderImage( image ) ) }
						{ featuredImage && this.props.multiple && this.renderUploadPlaceholder() }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( ImageSelectorPreview );
