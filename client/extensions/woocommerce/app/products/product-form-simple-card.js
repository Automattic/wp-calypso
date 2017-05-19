/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormCheckbox from 'components/forms/form-checkbox';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormDimensionsInput from '../../components/form-dimensions-input';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

const ProductFormSimpleCard = ( { product, editProduct, translate } ) => {
	const setDimension = ( e ) => {
		const dimensions = { ...product.dimensions, [ e.target.name ]: e.target.value };
		editProduct( product, { dimensions } );
	};

	const setWeight = ( e ) => {
		editProduct( product, { weight: e.target.value } );
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
			<FormCurrencyInput
				currencySymbolPrefix="$"
				name="price"
				value={ product.regular_price || '' }
				onChange={ setPrice }
				size="4"
			/>
		</Card>
	);

	// TODO pull in dimension and weight units.
	const renderDeliveryDetails = () => (
		<Card className="products__product-form-delivery-details">
			<div className="products__product-dimensions-weight">
				<FormFieldSet className="products__product-dimensions-input">
					<FormLabel>{ translate( 'Dimensions' ) }</FormLabel>
					<FormDimensionsInput
						unit={ translate( 'in' ) }
						dimensions={ product.dimensions }
						onChange={ setDimension }
					/>
				</FormFieldSet>
				<FormFieldSet className="products__product-weight-input">
					<FormLabel>{ translate( 'Weight' ) }</FormLabel>
					<FormTextInputWithAffixes
						name="weight"
						type="number"
						suffix="g"
						value={ product.weight || '' }
						onChange={ setWeight }
						size="4"
					/>
				</FormFieldSet>
			</div>
			<FormSettingExplanation>{ translate(
				'Shipping services will use this data to provide accurate rates.'
			) }</FormSettingExplanation>
		</Card>
	);

	const renderStock = () => (
		<Card className="products__product-form-stock">
			<div className="products__product-manage-stock-wrapper">
				<FormLabel>{ translate( 'Manage stock' ) }</FormLabel>
				<div className="products__product-manage-stock">
					<div className="products__product-manage-stock-checkbox">
						<FormCheckbox
							checked={ Boolean( product.manage_stock ) }
							name="manage_stock"
							onChange={ toggleStock } />
					</div>

					{ product.manage_stock && (
						<FormTextInput
							name="stock_quantity"
							value={ product.stock_quantity || '' }
							type="number"
							onChange={ setStockQuantity }
							placeholder={ translate( 'Quantity' ) } />
					) }
				</div>
			</div>
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
		weight: PropTypes.number,
		regular_price: PropTypes.number,
		manage_stock: PropTypes.bool,
		stock_quantity: PropTypes.number,
		backorders: PropTypes.string,
	} ),
	editProduct: PropTypes.func.isRequired,
};

export default localize( ProductFormSimpleCard );
