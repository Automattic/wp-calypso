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

export class EditorImageSelectorPreview extends Component {
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
			if ( this.state.images ) {
				return;
			}

			defer( () => {
				this.props.itemIds.map( id => {
					id = parseInt( id, 10 );
					MediaActions.fetch( this.props.siteId, id );
				} );
			} );
		} );
	};

	updateImageState = callback => {
		if ( isEqual( this.state.images.map( image => image.ID ), this.props.itemIds ) ) {
			return;
		}

		const images = uniq(
			this.props.itemIds
				.map( id => {
					const media = MediaStore.get( this.props.siteId, id );
					if ( ! media ) {
						MediaActions.fetch( this.props.siteId, id );
					}
					return media;
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
			if ( this.props.onImageChange && images && images.length ) {
				this.props.onImageChange( images );
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
				<Spinner />
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
		const { showEditIcon, translate } = this.props;
		const id = image.ID || image.transientId;

		const removeImage = () => {
			this.props.onRemoveImage( id );
		};

		const classes = classNames( 'editor-image-selector__item', {
			preview: null === src,
		} );

		return (
			<div className={ classes } key={ id }>
				<Button
					className="editor-image-selector__image"
					onClick={ this.props.onImageClick }
					borderless
					compact
					data-tip-target="editor-image-selector-image"
				>
					{ src ? this.renderUploaded( image ) : this.renderPlaceholder( image ) }
					{ showEditIcon && (
						<Gridicon icon="pencil" className="editor-image-selector__edit-icon" />
					) }
				</Button>
				<Button
					onClick={ removeImage }
					compact
					aria-label={ translate( 'Remove image' ) }
					className="editor-image-selector__remove"
				>
					<Gridicon icon="cross-small" size={ 24 } className="editor-image-selector__remove-icon" />
				</Button>
			</div>
		);
	};

	renderUploadPlaceholder() {
		const { translate, compact, multiple } = this.props;

		const classes = classNames( 'editor-image-selector__uploader-wrapper', {
			compact,
		} );

		const addString = multiple ? translate( 'Add images' ) : translate( 'Add image' );
		const iconSize = compact ? 24 : 36;

		return (
			<Button
				className={ classes }
				onClick={ this.props.onImageClick }
				borderless
				compact
				data-tip-target="editor-image-selector-image"
			>
				<div className="editor-image-selector__uploader-picker">
					<div className="editor-image-selector__uploader-label">
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

		return (
			<div className="editor-image-selector__images-wrapper">
				<div className="editor-image-selector__images">
					<div className="editor-image-selector__images-featured">
						{ featuredImage && this.renderImage( featuredImage ) }
						{ ! featuredImage && this.renderUploadPlaceholder() }
					</div>
					<div className="editor-image-selector__images-thumbs">
						{ images && images.map( image => this.renderImage( image ) ) }
						{ featuredImage && this.props.multiple && this.renderUploadPlaceholder() }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( EditorImageSelectorPreview );
