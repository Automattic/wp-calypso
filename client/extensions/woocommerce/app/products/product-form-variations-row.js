/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import Button from 'components/button';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';
import ImageSelector from 'blocks/image-selector';
import PriceInput from 'woocommerce/components/price-input';

class ProductFormVariationsRow extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.object.isRequired,
		variation: PropTypes.object.isRequired,
		manageStock: PropTypes.bool,
		onShowDialog: PropTypes.func,
		editProductVariation: PropTypes.func.isRequired,
		storeIsManagingStock: PropTypes.string,
	};

	// TODO: Consildate the following set/toggle functions with a helper (along with the form-details functions).
	setPrice = e => {
		const { siteId, editProductVariation, product, variation } = this.props;
		editProductVariation( siteId, product, variation, { regular_price: e.target.value } );
	};

	setWeight = e => {
		const { siteId, editProductVariation, product, variation } = this.props;
		editProductVariation( siteId, product, variation, { weight: e.target.value } );
	};

	setDimension = e => {
		const { siteId, editProductVariation, product, variation } = this.props;
		const dimensions = { ...variation.dimensions, [ e.target.name ]: e.target.value };
		editProductVariation( siteId, product, variation, { dimensions } );
	};

	setStockQuantity = e => {
		const { siteId, editProductVariation, product, variation } = this.props;
		const stock_quantity = Number( e.target.value ) >= 0 ? e.target.value : '';
		const manage_stock = stock_quantity !== '';
		editProductVariation( siteId, product, variation, { stock_quantity, manage_stock } );
	};

	showDialog = () => {
		const { variation, onShowDialog } = this.props;
		onShowDialog( variation.id );
	};

	setImage = media => {
		if ( ! media || ! media.items.length ) {
			return;
		}

		const { siteId, editProductVariation, product, variation } = this.props;
		const image = {
			id: media.items[ 0 ].ID,
		};

		editProductVariation( siteId, product, variation, { image } );
	};

	changeImages = newImages => {
		const { siteId, editProductVariation, product, variation } = this.props;
		const image = {
			id: newImages[ 0 ].ID,
		};
		editProductVariation( siteId, product, variation, { image } );
	};

	removeImage = () => {
		const { siteId, editProductVariation, product, variation } = this.props;
		editProductVariation( siteId, product, variation, { image: {} } );
	};

	renderImage = () => {
		const { variation } = this.props;
		const imageIds = variation.image ? [ variation.image.id ] : [];

		return (
			<div className="products__product-form-variation-image">
				<ImageSelector
					compact
					multiple={ false }
					imageIds={ imageIds }
					onImageSelected={ this.setImage }
					onImageChange={ this.changeImages }
					onRemoveImage={ this.removeImage }
					onAddImage={ this.addImage }
				/>
			</div>
		);
	};

	render() {
		const { variation, translate, storeIsManagingStock } = this.props;
		const stockDisabled = 'no' === storeIsManagingStock ? true : false;

		return (
			<tr className="products__product-form-variation-row">
				<td className="products__product-id">
					<div className="products__product-name-thumb">
						{ this.renderImage() }
						<Button
							borderless
							className="products__product-name products__variation-settings-link"
							onClick={ this.showDialog }
						>
							{ formattedVariationName( variation ) }
						</Button>
					</div>
				</td>
				<td>
					<div className="products__product-manage-stock">
						<FormTextInput
							name="stock_quantity"
							value={ variation.stock_quantity || '' }
							type="number"
							onChange={ this.setStockQuantity }
							placeholder={ translate( 'Quantity' ) }
							disabled={ stockDisabled }
						/>
					</div>
				</td>
				<td>
					<PriceInput
						noWrap
						value={ variation.regular_price || '' }
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
							dimensions={ variation.dimensions }
							onChange={ this.setDimension }
							noWrap
						/>
						<div className="products__product-weight-input">
							<FormWeightInput value={ variation.weight } onChange={ this.setWeight } noWrap />
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

export default localize( ProductFormVariationsRow );
