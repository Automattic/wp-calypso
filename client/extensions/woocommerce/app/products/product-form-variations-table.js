/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';
import PriceInput from 'woocommerce/components/price-input';
import ProductFormVariationsModal from './product-form-variations-modal';
import ProductFormVariationsRow from './product-form-variations-row';

class ProductFormVariationsTable extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		variations: PropTypes.array,
		product: PropTypes.object,
		editProductVariation: PropTypes.func.isRequired,
		onUploadStart: PropTypes.func.isRequired,
		onUploadFinish: PropTypes.func.isRequired,
		storeIsManagingStock: PropTypes.string,
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
		const { siteId, product, variations, editProductVariation } = this.props;
		this.setState( { [ field ]: value } );
		variations.map( function ( variation ) {
			editProductVariation( siteId, product, variation, { [ field ]: value } );
		} );
	}

	setPrice = ( e ) => {
		this.editAllVariations( 'regular_price', e.target.value );
	};

	setWeight = ( e ) => {
		this.editAllVariations( 'weight', e.target.value );
	};

	setStockQuantity = ( e ) => {
		const stock_quantity = Number( e.target.value ) >= 0 ? e.target.value : '';
		const manage_stock = stock_quantity !== '';
		this.editAllVariations( 'stock_quantity', stock_quantity );
		this.editAllVariations( 'manage_stock', manage_stock );
	};

	setDimension = ( e ) => {
		const dimensions = { ...this.state.dimensions, [ e.target.name ]: e.target.value };
		this.editAllVariations( 'dimensions', dimensions );
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
		const { siteId, variations, product, editProductVariation, translate } = this.props;
		const { showDialog, selectedVariation } = this.state;

		const buttons = [ { action: 'close', label: translate( 'Close' ) } ];

		return (
			<Dialog
				isVisible={ showDialog }
				buttons={ buttons }
				onClose={ this.onCloseDialog }
				className="products__product-form-variation-modal"
				additionalClassNames="woocommerce products__product-form-variation-dialog"
			>
				<ProductFormVariationsModal
					siteId={ siteId }
					product={ product }
					variations={ variations }
					selectedVariation={ selectedVariation }
					onShowDialog={ this.onShowDialog }
					editProductVariation={ editProductVariation }
				/>
			</Dialog>
		);
	}

	renderVariationRow = ( variation, index ) => {
		const { siteId, product, variations, editProductVariation, storeIsManagingStock } = this.props;
		const manageStock = find( variations, ( v ) => v.manage_stock ) ? true : false;
		return (
			<ProductFormVariationsRow
				siteId={ siteId }
				key={ index }
				product={ product }
				variation={ variation }
				manageStock={ manageStock }
				editProductVariation={ editProductVariation }
				onShowDialog={ this.onShowDialog }
				onUploadStart={ this.props.onUploadStart }
				onUploadFinish={ this.props.onUploadFinish }
				storeIsManagingStock={ storeIsManagingStock }
			/>
		);
	};

	renderBulkRow() {
		const { translate, storeIsManagingStock } = this.props;
		const { regular_price, dimensions, weight, stock_quantity } = this.state;

		return (
			<tr className="products__product-form-variation-all-row">
				<td className="products__product-id">
					<div className="products__product-name">{ translate( 'All variations' ) }</div>
				</td>
				<td>
					<div className="products__product-manage-stock">
						<FormTextInput
							name="stock_quantity"
							value={ stock_quantity }
							type="number"
							onChange={ this.setStockQuantity }
							placeholder={ translate( 'Quantity' ) }
							disabled={ 'no' === storeIsManagingStock }
						/>
					</div>
				</td>
				<td>
					<PriceInput
						noWrap
						value={ regular_price }
						name="price"
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
							<FormWeightInput value={ weight } onChange={ this.setWeight } noWrap />
						</div>
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
								<th />
								<th>{ translate( 'Inventory' ) }</th>
								<th className="products__product-price">{ translate( 'Price' ) }</th>
								<th>{ translate( 'Dimensions & weight' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderBulkRow() }
							{ variations.map( this.renderVariationRow ) }
						</tbody>
					</table>
					{ this.renderModal() }
				</div>
			</div>
		);
	}
}

export default localize( ProductFormVariationsTable );
