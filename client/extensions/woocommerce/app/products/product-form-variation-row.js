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
		const { variation, manageStock } = this.props;
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
				<td className="products__product-id">
					<div className="products__product-name-thumb">
						{ ! allVariationsRow && (
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
						onChange={ this.setPrice }
						size="4"
					/>
				</td>
				<td>
					<div className="products__product-dimensions-weight">
						<FormDimensionsInput
							className="products__product-dimensions-input"
							unit="in"
							dimensions={ dimensions }
							onChange={ this.setDimension }
						/>
						<div className="products__product-weight-input">
							<FormTextInputWithAffixes
								name="weight"
								type="number"
								suffix="g"
								value={ variation.weight || '' }
								onChange={ this.setWeight }
								size="4"
							/>
						</div>
					</div>
				</td>
				<td>
					<div className="products__product-manage-stock">
						{ allVariationsRow && (
							<div className="products__product-manage-stock-checkbox">
								<FormCheckbox checked={ Boolean( variation.manage_stock ) } onChange={ this.toggleStock } />
							</div>
						) }
						{ manageStock && (
							<FormTextInput
								name="stock_quantity"
								value={ variation.stock_quantity || '' }
								type="number"
								onChange={ this.setStockQuantity }
							/>
						) }
					</div>
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
