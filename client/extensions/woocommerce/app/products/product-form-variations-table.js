/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import Dialog from 'components/dialog';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';
import ProductFormVariationsModal from './product-form-variations-modal';
import ProductFormVariationsRow from './product-form-variations-row';

class ProductFormVariationsTable extends React.Component {

	static propTypes = {
		variations: PropTypes.array,
		product: PropTypes.object,
		editProductVariation: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			showDialog: false,
			selectedVariation: null,
			regular_price: '',
			weight: '',
			dimensions: {},
			stock_quantity: '',
			manage_stock: false,
		};

		this.onShowDialog = this.onShowDialog.bind( this );
		this.onCloseDialog = this.onCloseDialog.bind( this );
	}

	editAllVariations( field, value ) {
		const { product, variations, editProductVariation } = this.props;
		this.setState( { [ field ]: value } );
		variations.map( function( variation ) {
			editProductVariation( product, variation, { [ field ]: value } );
		} );
	}

	setPrice = ( e ) => {
		this.editAllVariations( 'regular_price', e.target.value );
	}

	setWeight = ( e ) => {
		this.editAllVariations( 'weight', e.target.value );
	}

	setStockQuantity = ( e ) => {
		const stock_quantity = Number( e.target.value ) >= 0 ? e.target.value : '';
		this.editAllVariations( 'stock_quantity', stock_quantity );
	}

	setDimension = ( e ) => {
		const dimensions = { ...this.state.dimensions, [ e.target.name ]: e.target.value };
		this.editAllVariations( 'dimensions', dimensions );
	}

	toggleStock = () => {
		const manage_stock = ! this.state.manage_stock;
		if ( this.state.manage_stock ) {
			this.editAllVariations( 'stock_quantity', '' );
		}
		this.editAllVariations( 'manage_stock', manage_stock );
	};

	onShowDialog( selectedVariation ) {
		this.setState( {
			showDialog: true,
			selectedVariation,
		} );
	}

	onCloseDialog() {
		this.setState( {
			showDialog: false,
			selectedVariation: null,
		} );
	}

	renderModal() {
		const { variations, product, editProductVariation, translate } = this.props;
		const { showDialog, selectedVariation } = this.state;

		const buttons = [
			{ action: 'close', label: translate( 'Close' ) },
		];

		return (
			<Dialog
				isVisible={ showDialog }
				buttons={ buttons }
				onClose={ this.onCloseDialog }
				className="products__product-form-variation-modal"
				additionalClassNames="woocommerce products__product-form-variation-dialog"
			>
				<ProductFormVariationsModal
					product={ product }
					variations={ variations }
					selectedVariation={ selectedVariation }
					onShowDialog={ this.onShowDialog }
					editProductVariation={ editProductVariation }
				/>
			</Dialog>
		);
	}

	renderVariationRow( variation ) {
		const { product, variations, editProductVariation } = this.props;
		const id = isNumber( variation.id ) && variation.id || 'index_' + variation.id.index;
		const manageStock = ( find( variations, ( v ) => v.manage_stock ) ) ? true : false;

		return (
			<ProductFormVariationsRow
				key={ id }
				product={ product }
				variation={ variation }
				manageStock={ manageStock }
				editProductVariation={ editProductVariation }
				onShowDialog={ this.onShowDialog }
			/>
		);
	}

	renderBulkRow() {
		const { translate, variations } = this.props;
		const { regular_price, dimensions, weight, stock_quantity } = this.state;
		const manageStock = ( find( variations, ( v ) => v.manage_stock ) ) ? true : false;

		return (
			<tr className="products__product-form-variation-all-row">
				<td className="products__product-id">
					<div className="products__product-name">
						{ translate( 'All variations' ) }
					</div>
				</td>
				<td>
					<FormCurrencyInput noWrap
						currencySymbolPrefix="$"
						name="price"
						value={ regular_price }
						placeholder="0.00"
						onChange={ this.setPrice }
						size="4"
					/>
				</td>
				<td>
					<div className="products__product-dimensions-weight">
						<FormDimensionsInput
							className="products__product-dimensions-input"
							noWrap
							dimensions={ dimensions }
							onChange={ this.setDimension }
						/>
						<div className="products__product-weight-input">
							<FormWeightInput
								value={ weight }
								onChange={ this.setWeight }
								noWrap
							/>
						</div>
					</div>
				</td>
				<td>
					<div className="products__product-manage-stock">
						<div className="products__product-manage-stock-toggle">
							<CompactFormToggle
								checked={ manageStock }
								onChange={ this.toggleStock }
							/>
						</div>
						{ manageStock && ( <FormTextInput
							name="stock_quantity"
							value={ stock_quantity }
							type="number"
							placeholder={ translate( 'Quantity' ) }
							onChange={ this.setStockQuantity }
						/> ) }
					</div>
				</td>
			</tr>
		);
	}

	render() {
		const { variations, translate } = this.props;

		if ( ! variations || variations.length === 0 ) {
			return null;
		}

		return (
			<div className="products__product-form-variation-table-shadow">
				<div className="products__product-form-variation-table-wrapper">
					<table className="products__product-form-variation-table">
						<thead>
							<tr>
								<th></th>
								<th className="products__product-price">{ translate( 'Price' ) }</th>
								<th>{ translate( 'Dimensions & weight' ) }</th>
								<th>{ translate( 'Manage stock' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderBulkRow() }
							{ variations.map( ( v ) => this.renderVariationRow( v ) ) }
						</tbody>
					</table>
					{ this.renderModal() }
				</div>
			</div>
		);
	}

}

export default localize( ProductFormVariationsTable );
