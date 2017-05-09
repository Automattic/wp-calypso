/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormDimensionsInput from '../../components/form-dimensions-input';
import formattedVariationName from '../../lib/formatted-variation-name';

const ProductFormVariationsRow = ( { product, variation, manageStock, editProductVariation } ) => {
	// TODO: Consildate the following set/toggle functions with a helper (along with the form-details functions).
	const setPrice = ( e ) => {
		editProductVariation( product, variation, { regular_price: e.target.value } );
	};

	const setWeight = ( e ) => {
		editProductVariation( product, variation, { weight: e.target.value } );
	};

	const setDimension = ( e ) => {
		const dimensions = { ...variation.dimensions, [ e.target.name ]: e.target.value };
		editProductVariation( product, variation, { dimensions } );
	};

	const setStockQuantity = ( e ) => {
		editProductVariation( product, variation, { stock_quantity: e.target.value } );
	};

	const toggleVisible = () => {
		editProductVariation( product, variation, { visible: ! variation.visible } );
	};

	const toggleStock = () => {
		editProductVariation( product, variation, { manage_stock: ! variation.manage_stock } );
	};

	// A variation with empty attributes is a 'fallback variation'.
	// We use this for the "All variations" row in the table, as defaults for the other variations.
	const fallbackRow = ! variation.attributes.length;
	const rowClassName = 'products__product-form-variation-' + ( fallbackRow && 'all-row' || 'row' );

	return (
		<tr className={ rowClassName }>
			<td>
				{ ! fallbackRow && (
					<FormCheckbox checked={ variation.visible } onChange={ toggleVisible } />
				) }
			</td>
			<td className="products__product-id">
				<div className="products__product-name-thumb">
					{ ! fallbackRow && (
						<div className="products__product-form-variation-image"></div>
					) }
					<div className="products__product-name">
						{ formattedVariationName( variation, 'All variations' ) }
					</div>
				</div>
			</td>
			<td>
				<FormCurrencyInput
					currencySymbolPrefix="$"
					name="price"
					value={ variation.regular_price || '' }
					onChange={ setPrice }
					size="4"
				/>
			</td>
			<td>
				<div className="products__product-dimensions-weight">
					<FormDimensionsInput
						className="products__product-dimensions-input"
						unit="in"
						dimensions={ variation.dimensions }
						onChange={ setDimension }
					/>
					<div className="products__product-weight-input">
						<FormTextInputWithAffixes
							name="weight"
							type="number"
							suffix="g"
							value={ variation.weight || '' }
							onChange={ setWeight }
							size="4"
						/>
					</div>
				</div>
			</td>
			<td>
				<div className="products__product-manage-stock">
					{ fallbackRow && (
						<div className="products__product-manage-stock-checkbox">
							<FormCheckbox checked={ Boolean( variation.manage_stock ) } onChange={ toggleStock } />
						</div>
					) }
					{ manageStock && (
						<FormTextInput
							name="stock_quantity"
							value={ variation.stock_quantity || '' }
							type="number"
							onChange={ setStockQuantity }
						/>
					) }
				</div>
			</td>
			<td>
				{ ! fallbackRow && (
					<Gridicon icon="cog" />
				) }
			</td>
		</tr>
	);
};

ProductFormVariationsRow.propTypes = {
	product: PropTypes.object.isRequired,
	variation: PropTypes.object.isRequired,
	manageStock: PropTypes.bool,
	editProductVariation: PropTypes.func.isRequired,
};

export default localize( ProductFormVariationsRow );
