/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { trim, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import FormClickToEditInput from 'woocommerce/components/form-click-to-edit-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import ProductFormImages from './product-form-images';
import ProductReviewsWidget from 'woocommerce/components/product-reviews-widget';

class ProductFormDetailsCard extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string,
			name: PropTypes.string,
		} ),
		editProduct: PropTypes.func.isRequired,
		onUploadStart: PropTypes.func,
		onUploadFinish: PropTypes.func,
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
			const sku = trim( name ).toLowerCase().replace( /\s+/g, '-' );
			editProduct( siteId, product, { sku } );
		}
	}

	setSku = ( sku ) => {
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

	onImageUpload = ( image ) => {
		const { siteId, product, editProduct } = this.props;
		const images = ( product.images && [ ...product.images ] ) || [];
		images.push( {
			id: image.ID,
			src: image.URL,
		} );
		editProduct( siteId, product, { images } );
	};

	onImageRemove = ( id ) => {
		const { siteId, product, editProduct } = this.props;
		const images = ( product.images && [ ...product.images ].filter( ( i ) => i.id !== id ) ) || [];
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
		const { product, translate } = this.props;

		let productReviewsWidget = null;

		if ( isNumber( product.id ) ) {
			productReviewsWidget = <ProductReviewsWidget product={ product } />;
		}

		const images = product.images || [];

		return (
			<Card className="products__product-form-details">
				<div className="products__product-form-details-wrapper">
					<ProductFormImages
						images={ images }
						onUpload={ this.onImageUpload }
						onRemove={ this.onImageRemove }
						onUploadStart={ this.props.onUploadStart }
						onUploadFinish={ this.props.onUploadFinish }
					/>
					<div className="products__product-form-details-basic">
						<FormFieldSet className="products__product-form-details-basic-name">
							<FormLabel htmlFor="name">{ translate( 'Product name' ) }</FormLabel>
							<FormTextInput id="name" value={ product.name || '' } onChange={ this.setName } />
						</FormFieldSet>
						<FormFieldSet className="products__product-form-details-basic-sku">
							<FormLabel htmlFor="sku">{ translate( 'SKU:' ) }</FormLabel>
							<FormClickToEditInput
								id="sku"
								value={ product.sku || '' }
								placeholder="-"
								updateAriaLabel={ translate( 'Update SKU' ) }
								editAriaLabel={ translate( 'Edit SKU' ) }
								onChange={ this.setSku }
								disabled={ product.name || product.sku ? false : true }
							/>
						</FormFieldSet>
						<FormFieldSet className="products__product-form-details-basic-description">
							<FormLabel htmlFor="description">{ translate( 'Description' ) }</FormLabel>
							{ this.renderTinyMCE() }
						</FormFieldSet>
						{ productReviewsWidget }
					</div>
				</div>
			</Card>
		);
	}
}

export default localize( ProductFormDetailsCard );
