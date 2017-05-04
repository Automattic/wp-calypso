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

class ProductFormVariationRow extends React.Component {

	static propTypes = {
		product: PropTypes.object.isRequired,
		variation: PropTypes.object.isRequired,
		manageStock: PropTypes.bool,
		editProductVariation: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.toggleVisible = this.toggleVisible.bind( this );
		this.toggleStock = this.toggleStock.bind( this );
		this.setPrice = this.setPrice.bind( this );
		this.setWeight = this.setWeight.bind( this );
		this.setDimension = this.setDimension.bind( this );
		this.setStockQuantity = this.setStockQuantity.bind( this );
	}

	// TODO Consider splitting out into a helper lib if we end up needing it in other places.
	formattedVariationName( { attributes } ) {
		return attributes.map( function( attribute ) {
			return attribute.option;
		} ).join( ' - ' );
	}

	// TODO: Consider consolidating the following set functions with a helper (along with the form-details functions).
	setPrice( e ) {
		const { variation, product, editProductVariation } = this.props;
		editProductVariation( product, variation, { regular_price: e.target.value } );
	}

	setWeight( e ) {
		const { variation, product, editProductVariation } = this.props;
		editProductVariation( product, variation, { weight: e.target.value } );
	}

	setDimension( e ) {
		const { variation, product, editProductVariation } = this.props;
		const dimensions = { ...variation.dimensions, [ e.target.name ]: e.target.value };
		editProductVariation( product, variation, { dimensions } );
	}

	setStockQuantity( e ) {
		const { variation, product, editProductVariation } = this.props;
		editProductVariation( product, variation, { stock_quantity: e.target.value } );
	}

	toggleVisible() {
		const { variation, product, editProductVariation } = this.props;
		editProductVariation( product, variation, { visible: ! variation.visible } );
	}

	toggleStock() {
		const { variation, product, editProductVariation } = this.props;
		editProductVariation( product, variation, { manage_stock: ! variation.manage_stock } );
	}

	// TODO Pull in correct currency, dimension, and weight from from settings.
	render() {
		const { variation, translate, manageStock } = this.props;
		const dimensions = variation.dimensions || { };
		const allVariationsRow = ! variation.attributes.length;
		const rowClassName = 'products__product-form-variation-' + ( allVariationsRow && 'all-row' || 'row' );

		return (
			<tr className={ rowClassName }>
				<td>
					{ ! allVariationsRow && (
						<FormCheckbox checked={ variation.visible } onChange={ this.toggleVisible } />
					) }
				</td>
				<td>
					{ ! allVariationsRow && (
						<div className="products__product-form-variation-image"></div>
					) }
					{ allVariationsRow && translate( 'All variations' ) || this.formattedVariationName( variation ) }
				</td>
				<td>
					<FormCurrencyInput
						currencySymbolPrefix="$"
						name="price"
						value={ variation.regular_price || '' }
						onChange={ this.setPrice }
					/>
				</td>
				<td>
					<FormTextInput
						name="length"
						placeholder={ translate( 'L' ) }
						type="number"
						value={ dimensions.length || '' }
						onChange={ this.setDimension }
					/>
					<FormTextInput
						name="width"
						placeholder={ translate( 'W' ) }
						type="number"
						value={ dimensions.width || '' }
						onChange={ this.setDimension }
					/>
					<FormTextInputWithAffixes
						name="height"
						placeholder={ translate( 'H' ) }
						suffix="in"
						type="number"
						value={ dimensions.height || '' }
						onChange={ this.setDimension }
					/>
				</td>
				<td>
					<FormTextInputWithAffixes
						name="weight"
						type="number"
						suffix="g"
						value={ variation.weight || '' }
						onChange={ this.setWeight }
					/>
				</td>
				<td>
					{ allVariationsRow && (
						<FormCheckbox checked={ Boolean( variation.manage_stock ) } onChange={ this.toggleStock } />
					) }
					{ manageStock && (
						<FormTextInput
							name="stock_quantity"
							value={ variation.stock_quantity || '' }
							type="number"
							onChange={ this.setStockQuantity }
						/>
					) }
				</td>
				<td>
					{ ! allVariationsRow && (
						<Gridicon icon="cog" />
					) }
				</td>
			</tr>
		);
	}

}

export default localize( ProductFormVariationRow );
