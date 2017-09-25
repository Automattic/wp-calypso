/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { isNumber, noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ImagePreloader from 'components/image-preloader';
import Spinner from 'components/spinner';
import ProductImageUploader from 'woocommerce/components/product-image-uploader';

class ProductFormImages extends Component {
	static propTypes = {
		images: PropTypes.arrayOf( PropTypes.shape( {
			id: PropTypes.number.isRequired,
			src: PropTypes.string.isRequired,
		} ) ),
		onUpload: PropTypes.func.isRequired,
		onRemove: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onUpload: noop,
		onRemove: noop,
	}

	constructor( props ) {
		super( props );
		const { images } = this.props;
		// Images are stored incomponent state so that we can display placeholder images
		// as they upload, along side previously uploaded images.
		this.state = {
			images,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.images !== this.props.images ) {
			this.setState( { images: nextProps.images } );
		}
	}

	onUpload = ( file ) => {
		const { onUpload } = this.props;
		onUpload( file );

		// Update a placeholder entry with the final source image.
		const images = [ ...this.state.images ].map( ( i ) => {
			if ( i.transientId === file.transientId ) {
				return { ...i,
					src: file.URL,
					id: file.ID,
				};
			}
			return i;
		} );

		this.setState( {
			images,
		} );
	}

	onSelect = ( files ) => {
		const { images } = this.state;
		const newImages = files.map( ( file ) => {
			return {
				placeholder: file.preview,
				transientId: file.ID,
				src: null,
				id: null,
			};
		} );
		this.setState( {
			images: [ ...images, ...newImages ],
		} );
	}

	onError = ( file ) => {
		const images = [ ...this.state.images ].filter( i => i.transientId !== file.transientId );
		this.setState( {
			images
		} );
	}

	removeImage = ( id ) => {
		let images = [ ...this.state.images ];
		if ( isNumber( id ) ) {
			images = images.filter( i => i.id !== id ) || [];
			this.props.onRemove( id );
		} else {
			images = images.filter( i => i.transientId !== id ) || [];
		}

		this.setState( {
			images,
		} );
	}

	renderPlaceholder = ( image ) => {
		const { placeholder } = image;
		return (
			<figure>
				<img src={ placeholder || ( <span /> ) } />
				<Spinner />
			</figure>
		);
	}

	renderUploaded = ( image ) => {
		const { src, placeholder } = image;
		return (
			<figure>
				<ImagePreloader
					src={ src }
					placeholder={ placeholder && ( <img src={ placeholder } /> ) || ( <span /> ) }
				/>
			</figure>
		);
	}

	renderImage = ( image, thumb = true ) => {
		const { src } = image;
		const id = image.id || image.transientId;

		const removeImage = () => {
			this.removeImage( id );
		};

		const classes = classNames( 'products__product-form-images-item', {
			preview: null === src,
			thumb,
		} );

		return (
			<div className={ classes } key={ id }>
				{ src && this.renderUploaded( image ) || this.renderPlaceholder( image ) }
				<Button
					onClick={ removeImage }
					compact
					className="products__product-form-images-item-remove">
					<Gridicon
						icon="cross-small"
						size={ 24 }
						className="products__product-form-images-item-remove-icon" />
				</Button>
			</div>
		);
	}

	render() {
		const { translate } = this.props;
		const images = [ ...this.state.images ];
		const featuredImage = images && images.shift() || null;

		return (
			<div className="products__product-form-images-wrapper">
				<div className="products__product-form-images">
					<div className="products__product-form-images-featured">
						{ featuredImage && this.renderImage( featuredImage, false ) }
					</div>

					<div className="products__product-form-images-thumbs">
						{ images.map( ( image ) =>
							this.renderImage( image )
						) }

						<ProductImageUploader
							onSelect={ this.onSelect }
							onUpload={ this.onUpload }
							onError={ this.onError }
							compact={ this.state.images.length > 0 }
						/>
					</div>
				</div>

				<FormSettingExplanation>{ translate(
					'For best results, upload photos larger than 1000x1000px.'
				) }</FormSettingExplanation>
			</div>
		);
	}
}

export default localize( ProductFormImages );
