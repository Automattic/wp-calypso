/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductVariationTypesForm from './product-variation-types-form';
import ProductFormVariationsTable from './product-form-variations-table';
import FormToggle from 'components/forms/form-toggle';

class ProductFormVariationsCard extends Component {

	state = {
		simpleProduct: [],
		variationAttributes: [],
	};

	static propTypes = {
		product: PropTypes.shape( {
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
			attributes: PropTypes.array,
		} ),
		variations: PropTypes.array,
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	simpleFields = [
		'dimensions', 'weight', 'regular_price',
		'manage_stock', 'stock_quantity', 'backorders',
	];

	/*
	 * When switching between product types, we clean up the Redux state to drop fields or variation attributes
	 * that are no longer valid, so we can keep API calls clean. This is done in setVariable and setSimple.
	 * To preserve a users edits, we store these changes in component state, and restore them if they toggle back.
	 * A user shouldn't lose work just because they locally toggled a card.
	 */
	handleToggle = () => {
		if ( 'variable' !== this.props.product.type ) {
			this.setProductTypeVariable();
		} else {
			this.setProductTypeSimple();
		}
	}

	setProductTypeVariable() {
		const { product, editProduct } = this.props;
		const attributes = product.attributes && [ ...product.attributes ] || [];
		const productData = { ...product };
		const simpleProduct = [ ...this.state.simpleProduct ];

		this.simpleFields.forEach( function( field ) {
			if ( product[ field ] ) {
				simpleProduct[ field ] = product[ field ];
				productData[ field ] = null;
			}
		} );
		this.state.variationAttributes.forEach( function( attribute ) {
			attributes.push( attribute );
		} );

		this.setState( { simpleProduct, variationAttributes: [] } );
		editProduct( product, {
			...productData,
			type: 'variable',
			attributes,
		} );
	}

	setProductTypeSimple() {
		const { product, editProduct } = this.props;
		const productData = { ...product };
		const simpleProduct = this.state.simpleProduct;

		this.simpleFields.forEach( function( field ) {
			if ( simpleProduct[ field ] ) {
				productData[ field ] = simpleProduct[ field ];
			}
		} );
		const variationAttributes = ( product.attributes && product.attributes.filter( attribute => attribute.variation ) ) || [];
		const attributes = ( product.attributes && product.attributes.filter( attribute => ! attribute.variation ) ) || null;

		this.setState( { variationAttributes, simpleProduct: [] } );
		editProduct( product, {
			...productData,
			type: 'simple',
			attributes,
		} );
	}

	render() {
		const { product, variations, translate, editProductAttribute, editProductVariation } = this.props;
		const variationToggleDescription = translate(
			'%(productName)s has variations, for example size and color.', {
				args: {
					productName: ( product && product.name ) || translate( 'This product' )
				}
			}
		);

		return (
			<FoldableCard
				icon=""
				expanded
				className="products__variation-card"
				header={ ( <FormToggle onChange={ this.handleToggle } checked={ 'variable' === product.type }>
					{ variationToggleDescription }
				</FormToggle>
				) }
			>
				{ 'variable' === product.type && (
					<div>
						<ProductVariationTypesForm
							product={ product }
							editProductAttribute={ editProductAttribute }
						/>
						<ProductFormVariationsTable
							product={ product }
							variations={ variations }
							editProductVariation={ editProductVariation }
						/>
					</div>
				) }
			</FoldableCard>
		);
	}
}

export default localize( ProductFormVariationsCard );
