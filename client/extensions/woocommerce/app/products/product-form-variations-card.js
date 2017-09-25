/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ProductFormVariationsTable from './product-form-variations-table';
import ProductVariationTypesForm from './product-variation-types-form';
import FoldableCard from 'components/foldable-card';
import FormToggle from 'components/forms/form-toggle';

class ProductFormVariationsCard extends Component {

	state = {
		simpleProduct: [],
		variationAttributes: [],
	};

	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.shape( {
			type: PropTypes.string,
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
		const type = this.props.product.type || 'simple';

		if ( 'variable' !== type ) {
			this.setProductTypeVariable();
		} else {
			this.setProductTypeSimple();
		}
	}

	setProductTypeVariable() {
		const { siteId, product, editProduct } = this.props;
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
		editProduct( siteId, product, {
			...productData,
			type: 'variable',
			attributes,
		} );
	}

	setProductTypeSimple() {
		const { siteId, product, editProduct } = this.props;
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
		editProduct( siteId, product, {
			...productData,
			type: 'simple',
			attributes,
		} );
	}

	render() {
		const { siteId, product, variations, translate } = this.props;
		const { editProductAttribute, editProductVariation } = this.props;
		const type = product.type || 'simple';
		const variationToggleDescription = translate(
			'%(productName)s has variations, like size and color.', {
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
				header={ ( <FormToggle onChange={ this.handleToggle } checked={ 'variable' === type }>
					{ variationToggleDescription }
				</FormToggle>
				) }
			>
				{ 'variable' === type && (
					<div>
						<ProductVariationTypesForm
							siteId={ siteId }
							product={ product }
							editProductAttribute={ editProductAttribute }
						/>
						<ProductFormVariationsTable
							siteId={ siteId }
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
