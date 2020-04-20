/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isNull, isUndefined } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';
import PriceInput from 'woocommerce/components/price-input';

const ProductFormSimpleCard = ( {
	site,
	siteId,
	product,
	editProduct,
	translate,
	storeIsManagingStock,
} ) => {
	const setDimension = ( e ) => {
		const dimensions = { ...product.dimensions, [ e.target.name ]: e.target.value };
		editProduct( siteId, product, { dimensions } );
	};

	const setWeight = ( e ) => {
		const weight = e.target.value;
		Number( weight ) >= 0 && editProduct( siteId, product, { weight } );
	};

	const setPrice = ( e ) => {
		editProduct( siteId, product, { regular_price: e.target.value } );
	};

	const setStockQuantity = ( e ) => {
		let stock_quantity;
		let manage_stock;
		if ( e.target.value !== '' ) {
			stock_quantity = Number( e.target.value );
			manage_stock = true;
		} else {
			stock_quantity = null;
			manage_stock = false;
		}
		editProduct( siteId, product, { manage_stock, stock_quantity } );
	};

	const setBackorders = ( e ) => {
		editProduct( siteId, product, { backorders: e.target.value } );
	};

	const renderPrice = () => (
		<Card className="products__product-form-price">
			<FormLabel>{ translate( 'Price' ) }</FormLabel>
			<PriceInput
				noWrap
				value={ product.regular_price || '' }
				name="price"
				onChange={ setPrice }
				size="4"
				placeholder="0.00"
			/>
		</Card>
	);

	const renderDeliveryDetails = () => (
		<Card className="products__product-form-delivery-details">
			<div className="products__product-dimensions-weight">
				<FormFieldSet className="products__product-dimensions-input">
					<FormLabel>{ translate( 'Dimensions' ) }</FormLabel>
					<FormDimensionsInput dimensions={ product.dimensions } onChange={ setDimension } />
				</FormFieldSet>
				<FormFieldSet className="products__product-weight-input">
					<FormLabel>{ translate( 'Weight' ) }</FormLabel>
					<FormWeightInput value={ product.weight } onChange={ setWeight } />
				</FormFieldSet>
			</div>
			<FormSettingExplanation>
				{ translate(
					'Dimensions are used to calculate shipping. Enter the ' +
						'size of the product as you’d put it in a package. For ' +
						'a shirt, this would mean the size it is when folded. ' +
						'For a vase, this would mean including bubble wrap.'
				) }
			</FormSettingExplanation>
		</Card>
	);

	const stockClasses = classNames( 'products__product-form-stock', {
		'products__product-form-stock-disabled': ! product.manage_stock,
	} );

	const { stock_quantity } = product;
	const quantity = isNull( stock_quantity ) || isUndefined( stock_quantity ) ? '' : stock_quantity;

	const stockDisabled = 'no' === storeIsManagingStock ? true : false;
	const inventorySettingsUrl =
		site.URL + '/wp-admin/admin.php?page=wc-settings&tab=products&section=inventory';

	const renderStock = () => (
		<Card className={ stockClasses }>
			<div className="products__product-stock-options-wrapper">
				<div className="products__product-manage-stock">
					<FormLabel>{ translate( 'Inventory' ) }</FormLabel>
					<FormTextInput
						name="stock_quantity"
						value={ quantity }
						type="number"
						min="0"
						onChange={ setStockQuantity }
						placeholder={ translate( 'Quantity' ) }
						disabled={ stockDisabled }
					/>
				</div>
				{ product.manage_stock && (
					<div className="products__product-backorders-wrapper">
						<FormLabel>{ translate( 'Backorders' ) }</FormLabel>
						<FormSelect
							name="backorders"
							onChange={ setBackorders }
							value={ product.backorders || 'no' }
						>
							<option value="no">{ translate( 'Do not allow' ) }</option>
							<option value="notify">{ translate( 'Allow, but notify customer' ) }</option>
							<option value="yes">{ translate( 'Allow' ) }</option>
						</FormSelect>

						<FormSettingExplanation>
							{ translate(
								'Backorders allow customers to purchase products that are out of stock.'
							) }
						</FormSettingExplanation>
					</div>
				) }
				{ stockDisabled && (
					<FormSettingExplanation>
						{ translate(
							'Inventory management has been disabled for this store. ' +
								'You can enable it under your {{managementLink}}inventory settings{{/managementLink}}.',
							{
								components: {
									managementLink: (
										<a href={ inventorySettingsUrl } target="_blank" rel="noopener noreferrer" />
									),
								},
							}
						) }
					</FormSettingExplanation>
				) }
			</div>
		</Card>
	);

	return (
		<div>
			{ renderPrice() }
			{ renderDeliveryDetails() }
			{ renderStock() }
		</div>
	);
};

ProductFormSimpleCard.propTypes = {
	site: PropTypes.shape( {
		URL: PropTypes.string,
	} ),
	siteId: PropTypes.number,
	product: PropTypes.shape( {
		dimensions: PropTypes.object,
		weight: PropTypes.string,
		regular_price: PropTypes.string,
		manage_stock: PropTypes.bool,
		stock_quantity: PropTypes.number,
		backorders: PropTypes.string,
	} ),
	editProduct: PropTypes.func.isRequired,
	storeIsManagingStock: PropTypes.string,
};

export default localize( ProductFormSimpleCard );
