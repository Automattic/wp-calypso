/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductVariationTypesForm from './product-variation-types-form';
import ProductFormVariationsTable from './product-form-variations-table';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle';

class ProductFormVariationsCard extends Component {
	state = {
		simpleProduct: [],
		variationAttributes: [],
	};

	static propTypes = {
		site: PropTypes.shape( {
			URL: PropTypes.string,
		} ),
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
		onUploadStart: PropTypes.func.isRequired,
		onUploadFinish: PropTypes.func.isRequired,
		storeIsManagingStock: PropTypes.string,
	};

	simpleFields = [
		'dimensions',
		'weight',
		'regular_price',
		'manage_stock',
		'stock_quantity',
		'backorders',
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
	};

	setProductTypeVariable() {
		const { siteId, product, editProduct } = this.props;
		const attributes = ( product.attributes && [ ...product.attributes ] ) || [];
		const productData = { ...product };
		const simpleProduct = [ ...this.state.simpleProduct ];

		this.simpleFields.forEach( function ( field ) {
			if ( product[ field ] ) {
				simpleProduct[ field ] = product[ field ];
				productData[ field ] = null;
			}
		} );
		this.state.variationAttributes.forEach( function ( attribute ) {
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

		this.simpleFields.forEach( function ( field ) {
			if ( simpleProduct[ field ] ) {
				productData[ field ] = simpleProduct[ field ];
			}
		} );
		const variationAttributes =
			( product.attributes && product.attributes.filter( ( attribute ) => attribute.variation ) ) ||
			[];
		const attributes =
			( product.attributes &&
				product.attributes.filter( ( attribute ) => ! attribute.variation ) ) ||
			null;

		this.setState( { variationAttributes, simpleProduct: [] } );
		editProduct( siteId, product, {
			...productData,
			type: 'simple',
			attributes,
		} );
	}

	render() {
		const { site, siteId, product, variations, translate, storeIsManagingStock } = this.props;
		const { editProductAttribute, editProductVariation } = this.props;
		const type = product.type || 'simple';
		const variationToggleDescription = translate(
			'%(productName)s has variations, like size and color.',
			{
				args: {
					productName: ( product && product.name ) || translate( 'This product' ),
				},
			}
		);

		const inventorySettingsUrl =
			site.URL + '/wp-admin/admin.php?page=wc-settings&tab=products&section=inventory';

		return (
			<FoldableCard
				icon=""
				expanded
				className="products__variation-card"
				header={
					<FormToggle onChange={ this.handleToggle } checked={ 'variable' === type }>
						{ variationToggleDescription }
					</FormToggle>
				}
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
							onUploadStart={ this.props.onUploadStart }
							onUploadFinish={ this.props.onUploadFinish }
							storeIsManagingStock={ storeIsManagingStock }
						/>
						{ variations && variations.length && 'no' === storeIsManagingStock && (
							<FormSettingExplanation>
								{ translate(
									'Inventory management has been disabled for this store. ' +
										'You can enable it under your {{managementLink}}inventory settings{{/managementLink}}.',
									{
										components: {
											managementLink: (
												<a
													href={ inventorySettingsUrl }
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									}
								) }
							</FormSettingExplanation>
						) }
					</div>
				) }
			</FoldableCard>
		);
	}
}

export default localize( ProductFormVariationsCard );
