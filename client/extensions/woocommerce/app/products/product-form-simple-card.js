/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';

const ProductFormSimpleCard = ( { product, editProduct, translate } ) => {
	const setDimension = ( e ) => {
		const dimensions = { ...product.dimensions, [ e.target.name ]: e.target.value };
		editProduct( product, { dimensions } );
	};

	const setWeight = ( e ) => {
		const weight = e.target.value;
		Number( weight ) >= 0 && editProduct( product, { weight } );
	};

	const setPrice = ( e ) => {
		editProduct( product, { regular_price: e.target.value } );
	};

	const toggleStock = () => {
		editProduct( product, { manage_stock: ! product.manage_stock } );
	};

	const setStockQuantity = ( e ) => {
		editProduct( product, { stock_quantity: e.target.value } );
	};

	const setBackorders = ( e ) => {
		editProduct( product, { backorders: e.target.value } );
	};

	// TODO Pull in currency and currency position.
	const renderPrice = () => (
		<Card className="products__product-form-price">
			<FormLabel>{ translate( 'Price' ) }</FormLabel>
			<FormCurrencyInput
				currencySymbolPrefix="$"
				name="price"
				value={ product.regular_price || '' }
				onChange={ setPrice }
				size="4"
			/>
		</Card>
	);

	const renderDeliveryDetails = () => (
		<Card className="products__product-form-delivery-details">
			<div className="products__product-dimensions-weight">
				<FormFieldSet className="products__product-dimensions-input">
					<FormLabel>{ translate( 'Dimensions' ) }</FormLabel>
					<FormDimensionsInput
						dimensions={ product.dimensions }
						onChange={ setDimension }
					/>
				</FormFieldSet>
				<FormFieldSet className="products__product-weight-input">
					<FormLabel>{ translate( 'Weight' ) }</FormLabel>
					<FormWeightInput
						value={ product.weight }
						onChange={ setWeight }
					/>
				</FormFieldSet>
			</div>
			<FormSettingExplanation>{ translate(
				'Shipping services will use this data to provide accurate rates.'
			) }</FormSettingExplanation>
		</Card>
	);

	const stockClasses = classNames( 'products__product-form-stock', {
		'products__product-form-stock-disabled': ! product.manage_stock,
	} );

	const renderStock = () => (
		<Card className={ stockClasses }>
			<div className="products__product-manage-stock-toggle">
				<CompactFormToggle
					checked={ Boolean( product.manage_stock ) }
					name="manage_stock"
					onChange={ toggleStock } />
				<FormLabel onClick={ toggleStock }>{ translate( 'Manage stock' ) }</FormLabel>
			</div>
			<div className="products__product-stock-options-wrapper">
				{ product.manage_stock && (
					<div className="products__product-manage-stock">
						<FormLabel>{ translate( 'Quantity' ) }</FormLabel>
						<FormTextInput
							name="stock_quantity"
							value={ product.stock_quantity || '' }
							type="number"
							min="0"
							onChange={ setStockQuantity }
							placeholder={ translate( 'Quantity' ) } />
					</div>
				) }
				{ product.manage_stock && (
					<div className="products__product-backorders-wrapper">
						<FormLabel>{ translate( 'Backorders' ) }</FormLabel>
						<FormSelect name="backorders" onChange={ setBackorders } value={ product.backorders || 'no' } >
							<option value="no">{ translate( 'Do not allow' ) }</option>
							<option value="notify">{ translate( 'Allow, but notify customer' ) }</option>
							<option value="yes">{ translate( 'Allow' ) }</option>
						</FormSelect>

						<FormSettingExplanation>{ translate(
							'Backorders allow customers to purchase products that are out of stock.'
						) }</FormSettingExplanation>
					</div>
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
	product: PropTypes.shape( {
		dimensions: PropTypes.object,
		weight: PropTypes.string,
		regular_price: PropTypes.string,
		manage_stock: PropTypes.bool,
		stock_quantity: PropTypes.string,
		backorders: PropTypes.string,
	} ),
	editProduct: PropTypes.func.isRequired,
};

export default localize( ProductFormSimpleCard );
