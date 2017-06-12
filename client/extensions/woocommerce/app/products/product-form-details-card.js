/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';
import { trim, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import FormClickToEditInput from 'woocommerce/components/form-click-to-edit-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import ProductFormImages from './product-form-images';

export default class ProductFormDetailsCard extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
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
		this.debouncedSetDescription = debounce( this.setDescription, 200 );
	}

	// TODO: Consider consolidating the following set functions
	// into a general purpose Higher Order Component
	setName( e ) {
		const { product, editProduct } = this.props;
		const name = e.target.value;
		editProduct( product, { name } );

		if ( this.state.updateSkuOnNameChange ) {
			const sku = trim( name ).toLowerCase().replace( /\s+/g, '-' );
			editProduct( product, { sku } );
		}
	}

	setSku = ( sku ) => {
		const { product, editProduct } = this.props;
		editProduct( product, { sku } );

		if ( this.state.updateSkuOnNameChange ) {
			this.setState( {
				updateSkuOnNameChange: false,
			} );
		}
	}

	setDescription( description ) {
		const { product, editProduct } = this.props;
		editProduct( product, { description } );
	}

	onImageUpload = ( image ) => {
		const { product, editProduct } = this.props;
		const images = product.images && [ ...product.images ] || [];
		images.push( {
			id: image.ID,
			src: image.URL,
		} );
		editProduct( product, { images } );
	}

	onImageRemove = ( id ) => {
		const { product, editProduct } = this.props;
		const images = product.images && [ ...product.images ].filter( i => i.id !== id ) || [];
		editProduct( product, { images } );
	}

	render() {
		const { product } = this.props;
		const images = product.images || [];
		const __ = i18n.translate;

		return (
			<Card className="products__product-form-details">
				<div className="products__product-form-details-wrapper">
					<ProductFormImages
						images={ images }
						onUpload={ this.onImageUpload }
						onRemove={ this.onImageRemove }
					/>
					<div className="products__product-form-details-basic">
						<FormFieldSet className="products__product-form-details-basic-name">
							<FormLabel htmlFor="name">{ __( 'Product name' ) }</FormLabel>
							<FormTextInput
								id="name"
								value={ product.name || '' }
								onChange={ this.setName }
							/>
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
							<CompactTinyMCE
								value={ product.description || '' }
								onContentsChange={ this.debouncedSetDescription }
							/>
						</FormFieldSet>
					</div>
				</div>
			</Card>
		);
	}

}
