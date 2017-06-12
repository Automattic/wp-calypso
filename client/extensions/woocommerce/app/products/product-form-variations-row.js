/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { head } from 'lodash';

/**
 * Internal dependencies
 */
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import Button from 'components/button';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';
import ImagePreloader from 'components/image-preloader';
import ProductImageUploader from 'woocommerce/components/product-image-uploader';
import Spinner from 'components/spinner';

class ProductFormVariationsRow extends Component {
	static propTypes = {
		product: PropTypes.object.isRequired,
		variation: PropTypes.object.isRequired,
		manageStock: PropTypes.bool,
		onShowDialog: PropTypes.func,
		editProductVariation: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const { variation } = props;
		const image = variation && variation.image || {};

		this.state = {
			id: image.id || null,
			src: image.src || null,
			placeholder: null,
			transientId: null,
			isUploading: false,
		};
	}

	// TODO: Consildate the following set/toggle functions with a helper (along with the form-details functions).
	setPrice = ( e ) => {
		const { editProductVariation, product, variation } = this.props;
		editProductVariation( product, variation, { regular_price: e.target.value } );
	}

	setWeight = ( e ) => {
		const { editProductVariation, product, variation } = this.props;
		editProductVariation( product, variation, { weight: e.target.value } );
	}

	setDimension = ( e ) => {
		const { editProductVariation, product, variation } = this.props;
		const dimensions = { ...variation.dimensions, [ e.target.name ]: e.target.value };
		editProductVariation( product, variation, { dimensions } );
	}

	setStockQuantity = ( e ) => {
		const { editProductVariation, product, variation } = this.props;
		const stock_quantity = Number( e.target.value ) >= 0 ? e.target.value : '';
		editProductVariation( product, variation, { stock_quantity } );
	}

	showDialog = () => {
		const { variation, onShowDialog } = this.props;
		onShowDialog( variation.id );
	}

	onSelect = ( files ) => {
		const file = head( files );
		this.setState( {
			placeholder: file.preview,
			transientId: file.ID,
			isUploading: true,
		} );
	}

	onUpload = ( file ) => {
		const { editProductVariation, product, variation } = this.props;
		const image = {
			src: file.URL,
			id: file.ID,
		};
		this.setState( { ...image,
			transientId: null,
			isUploading: false,
		} );
		editProductVariation( product, variation, { image } );
	}

	onError = () => {
		this.setState( {
			placeholder: null,
			transientId: null,
			isUploading: false,
		} );
	}

	removeImage = () => {
		const { editProductVariation, product, variation } = this.props;
		this.setState( {
			placeholder: null,
			transientId: null,
			isUploading: false,
			src: null,
			id: null,
		} );
		editProductVariation( product, variation, { image: {} } );
	}

	renderImage = () => {
		const { src, placeholder, isUploading } = this.state;

		let image = null;
		if ( src && ! isUploading ) {
			image = (
				<figure>
					<ImagePreloader
						src={ src }
						placeholder={ placeholder && ( <img src={ placeholder } /> ) || ( <span /> ) }
					/>
				</figure>
			);
		} else if ( isUploading ) {
			image = (
				<figure>
					<img src={ placeholder || ( <span /> ) } />
					<Spinner />
				</figure>
			);
		}

		const classes = classNames( 'products__product-form-variation-image', {
			preview: null === src,
			uploader: ! image,
		} );

		const removeButton = image && (
			<Button
				compact
				onClick={ this.removeImage }
				className="products__product-form-variation-image-remove">
					<Gridicon
						icon="cross"
						size={ 24 }
						className="products__product-form-variation-image-remove-icon" />
			</Button>
		);

		return (
			<div className={ classes }>
				<ProductImageUploader
					compact
					multiple={ false }
					onSelect={ this.onSelect }
					onUpload={ this.onUpload }
					onError={ this.onError }
				>
					{image}
				</ProductImageUploader>
				{removeButton}
			</div>
		);
	}

	render() {
		const { variation, manageStock, translate } = this.props;
		return (
			<tr className="products__product-form-variation-row">
				<td className="products__product-id">
					<div className="products__product-name-thumb">
						{ this.renderImage() }
						<span className="products__product-name products__variation-settings-link" onClick={ this.showDialog }>
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
							<FormWeightInput
								value={ variation.weight }
								onChange={ this.setWeight }
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
							onChange={ this.setStockQuantity }
							placeholder={ translate( 'Quantity' ) }
						/> ) }
					</div>
				</td>
			</tr>
		);
	}
}

export default localize( ProductFormVariationsRow );
