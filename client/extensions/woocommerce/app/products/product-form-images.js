/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ImagePreloader from 'components/image-preloader';
import ProductImageUploader from 'woocommerce/components/product-image-uploader';
import Spinner from 'components/spinner';

class ProductFormImages extends Component {
	static propTypes = {
		product: PropTypes.shape( {
			images: PropTypes.array,
		} ),
		editProduct: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const { product } = this.props;
		const images = product.images || [];
		this.state = {
			images,
		};
	}

	onUpload = ( file ) => {
		const { product, editProduct } = this.props;
		const images = product.images && [ ...product.images ] || [];
		images.push( {
			id: file.ID,
			src: file.URL,
		} );
		editProduct( product, { images } );

		const stateImages = [ ...this.state.images ].map( ( i ) => {
			if ( i.transientId === file.transientId ) {
				return { ...i,
					src: file.URL,
					id: file.ID,
				};
			}
			return i;
		} );

		this.setState( {
			images: stateImages,
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

	removeImage = ( index ) => {
		const { product, editProduct } = this.props;
		const stateImages = [ ...this.state.images ];
		const removedImage = stateImages.splice( index, 1 );
		this.setState( {
			images: stateImages,
		} );

		const id = removedImage[ 0 ].id || null;
		if ( null !== id ) {
			const images = product.images && [ ...product.images ].filter( i => i.id !== id ) || [];
			editProduct( product, { images } );
		}
	}

	renderImage = ( image, index ) => {
		const { src, placeholder } = image;

		const removeImage = () => {
			this.removeImage( index );
		};

		const classes = classNames( 'products__product-form-images-item', {
			preview: null === src,
		} );

		return (
			<div className={ classes } key={ index }>
				{ src && (
					<figure>
						<ImagePreloader
							src={ src }
							placeholder={ placeholder && ( <img src={ placeholder } /> ) || ( <span /> ) }
						/>
					</figure>
				) || (
					<figure>
						<img src={ placeholder || ( <span /> ) } />
						<Spinner />
					</figure>
				) }
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
		const { images } = this.state;

		return (
			<div className="products__product-form-images-wrapper">
				<FormLabel>{ translate( 'Product Images' ) }</FormLabel>

				<div className="products__product-form-images">
					{ images.map( ( image, index ) =>
						this.renderImage( image, index )
					) }
					<ProductImageUploader
						onSelect={ this.onSelect }
						onUpload={ this.onUpload }
						onError={ this.onError }
						compact={ images.length > 0 }
					/>
				</div>

				<FormSettingExplanation>{ translate(
					'For best results, upload photos larger than 1000x1000px.'
				) }</FormSettingExplanation>
			</div>
		);
	}
}

export default localize( ProductFormImages );
