/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { trim, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import FormClickToEditInput from 'woocommerce/components/form-click-to-edit-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import ImageSelector from 'blocks/image-selector';
import ProductReviewsWidget from 'woocommerce/components/product-reviews-widget';

export default class ProductFormDetailsCard extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string,
			name: PropTypes.string,
		} ),
		editProduct: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		const { product } = props;
		this.state = {
			updateSkuOnNameChange: ! product.name,
		};

		this.setName = this.setName.bind( this );
		this.setDescription = this.setDescription.bind( this );
	}

	// TODO: Consider consolidating the following set functions
	// into a general purpose Higher Order Component
	setName( e ) {
		const { siteId, product, editProduct } = this.props;
		const name = e.target.value;
		editProduct( siteId, product, { name } );

		if ( this.state.updateSkuOnNameChange ) {
			const sku = trim( name )
				.toLowerCase()
				.replace( /\s+/g, '-' );
			editProduct( siteId, product, { sku } );
		}
	}

	setSku = sku => {
		const { siteId, product, editProduct } = this.props;
		editProduct( siteId, product, { sku } );

		if ( this.state.updateSkuOnNameChange ) {
			this.setState( {
				updateSkuOnNameChange: false,
			} );
		}
	};

	setDescription( description ) {
		const { siteId, product, editProduct } = this.props;
		editProduct( siteId, product, { description } );
	}

	setImage = media => {
		if ( ! media || ! media.items.length ) {
			return;
		}
		const { siteId, product, editProduct } = this.props;
		const images = media.items.map( item => ( { id: item.ID } ) );
		editProduct( siteId, product, { images } );
	};

	changeImages = newImages => {
		const { siteId, product, editProduct } = this.props;
		const images = newImages.map( image => ( { id: image.ID } ) );
		editProduct( siteId, product, { images } );
	};

	removeImage = image => {
		const { siteId, product, editProduct } = this.props;
		const images =
			( product.images && [ ...product.images ].filter( i => i.id !== image.ID ) ) || [];
		editProduct( siteId, product, { images } );
	};

	addImage = image => {
		const { siteId, product, editProduct } = this.props;
		const images = ( product.images && [ ...product.images ] ) || [];
		images.push( {
			id: image.ID,
			src: image.URL,
		} );
		editProduct( siteId, product, { images } );
	};

	renderTinyMCE = () => {
		const { product } = this.props;

		if (
			( isNumber( product.id ) && 'undefined' === typeof product.description ) ||
			'undefined' === typeof product.id
		) {
			return <div className="products__product-form-tinymce-placeholder" />;
		}

		return (
			<CompactTinyMCE
				initialValue={ product.description || '' }
				onContentsChange={ this.setDescription }
			/>
		);
	};

	render() {
		const { product } = this.props;

		let productReviewsWidget = null;

		if ( isNumber( product.id ) ) {
			productReviewsWidget = <ProductReviewsWidget product={ product } />;
		}

		const imageIds = product.images ? product.images.map( image => image.id ) : [];
		const __ = i18n.translate;

		return (
			<Card className="products__product-form-details">
				<div className="products__product-form-details-wrapper">
					<div className="products__product-form-images-wrapper">
						<ImageSelector
							compact={ imageIds && imageIds.length > 0 }
							imageIds={ imageIds }
							multiple
							onImageSelected={ this.setImage }
							onImageChange={ this.changeImages }
							onRemoveImage={ this.removeImage }
							onAddImage={ this.addImage }
							showEditIcon
						/>
						<FormSettingExplanation>
							{ __( 'For best results, upload photos larger than 1000x1000px.' ) }
						</FormSettingExplanation>
					</div>
					<div className="products__product-form-details-basic">
						<FormFieldSet className="products__product-form-details-basic-name">
							<FormLabel htmlFor="name">{ __( 'Product name' ) }</FormLabel>
							<FormTextInput id="name" value={ product.name || '' } onChange={ this.setName } />
						</FormFieldSet>
						<FormFieldSet className="products__product-form-details-basic-sku">
							<FormLabel htmlFor="sku">{ __( 'SKU:' ) }</FormLabel>
							<FormClickToEditInput
								id="sku"
								value={ product.sku || '' }
								placeholder="-"
								updateAriaLabel={ __( 'Update SKU' ) }
								editAriaLabel={ __( 'Edit SKU' ) }
								onChange={ this.setSku }
								disabled={ product.name || product.sku ? false : true }
							/>
						</FormFieldSet>
						<FormFieldSet className="products__product-form-details-basic-description">
							<FormLabel htmlFor="description">{ __( 'Description' ) }</FormLabel>
							{ this.renderTinyMCE() }
						</FormFieldSet>
						{ productReviewsWidget }
					</div>
				</div>
			</Card>
		);
	}
}
