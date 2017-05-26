/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formattedVariationName from '../../lib/formatted-variation-name';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormDimensionsInput from '../../components/form-dimensions-input';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

const ProductFormVariationsRow = ( {
	product,
	variation,
	editProductVariation,
	onShowDialog,
	translate,
	manageStock,
} ) => {
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
		const stock_quantity = Number( e.target.value ) >= 0 ? e.target.value : '';
		editProductVariation( product, variation, { stock_quantity } );
	};

	const showDialog = () => {
		onShowDialog( variation.id );
	};

	return (
		<tr className="products__product-form-variation-row">
			<td className="products__product-id">
				<div className="products__product-name-thumb">
					<div className="products__product-form-variation-image"></div>
					<span className="products__product-name products__variation-settings-link" onClick={ showDialog }>
						{ formattedVariationName( variation ) }
					</span>
				</div>
			</td>
			<td>
				<FormCurrencyInput noWrap
					currencySymbolPrefix="$"
					name="price"
					value={ variation.regular_price || '' }
					placeholder="0.00"
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
						noWrap
					/>
					<div className="products__product-weight-input">
						<FormTextInputWithAffixes
							name="weight"
							type="number"
							suffix="g"
							value={ variation.weight || '' }
							onChange={ setWeight }
							size="4"
							noWrap
						/>
					</div>
				</div>
			</td>
			<td>
				<div className="products__product-manage-stock">
					{ manageStock && ( <FormTextInput
						name="stock_quantity"
						value={ variation.stock_quantity || '' }
						type="number"
						onChange={ setStockQuantity }
						placeholder={ translate( 'Quantity' ) }
					/> ) }
				</div>
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
