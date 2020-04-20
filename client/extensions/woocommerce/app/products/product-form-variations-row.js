/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { head } from 'lodash';

/**
 * Internal dependencies
 */
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import { Button } from '@automattic/components';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormTextInput from 'components/forms/form-text-input';
import FormWeightInput from 'woocommerce/components/form-weight-input';
import MediaImage from 'my-sites/media-library/media-image';
import PriceInput from 'woocommerce/components/price-input';
import ProductImageUploader from 'woocommerce/components/product-image-uploader';
import Spinner from 'components/spinner';

class ProductFormVariationsRow extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		product: PropTypes.object.isRequired,
		variation: PropTypes.object.isRequired,
		manageStock: PropTypes.bool,
		onShowDialog: PropTypes.func,
		editProductVariation: PropTypes.func.isRequired,
		onUploadStart: PropTypes.func.isRequired,
		onUploadFinish: PropTypes.func.isRequired,
		storeIsManagingStock: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		const { variation } = props;
		const image = ( variation && variation.image ) || {};

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
		const { siteId, editProductVariation, product, variation } = this.props;
		editProductVariation( siteId, product, variation, { regular_price: e.target.value } );
	};

	setWeight = ( e ) => {
		const { siteId, editProductVariation, product, variation } = this.props;
		editProductVariation( siteId, product, variation, { weight: e.target.value } );
	};

	setDimension = ( e ) => {
		const { siteId, editProductVariation, product, variation } = this.props;
		const dimensions = { ...variation.dimensions, [ e.target.name ]: e.target.value };
		editProductVariation( siteId, product, variation, { dimensions } );
	};

	setStockQuantity = ( e ) => {
		const { siteId, editProductVariation, product, variation } = this.props;
		const stock_quantity = Number( e.target.value ) >= 0 ? e.target.value : '';
		const manage_stock = stock_quantity !== '';
		editProductVariation( siteId, product, variation, { stock_quantity, manage_stock } );
	};

	showDialog = () => {
		const { variation, onShowDialog } = this.props;
		onShowDialog( variation.id );
	};

	onSelect = ( files ) => {
		const file = head( files );
		this.setState( {
			placeholder: file.preview,
			transientId: file.ID,
			isUploading: true,
		} );
		this.props.onUploadStart();
	};

	onUpload = ( file ) => {
		const { siteId, editProductVariation, product, variation } = this.props;
		const image = {
			src: file.URL,
			id: file.ID,
		};
		this.setState( {
			...image,
			transientId: null,
			isUploading: false,
		} );
		editProductVariation( siteId, product, variation, { image } );
	};

	onError = () => {
		this.setState( {
			placeholder: null,
			transientId: null,
			isUploading: false,
		} );
	};

	removeImage = () => {
		const { siteId, editProductVariation, product, variation } = this.props;
		this.setState( {
			placeholder: null,
			transientId: null,
			isUploading: false,
			src: null,
			id: null,
		} );
		editProductVariation( siteId, product, variation, { image: {} } );
	};

	renderImage = () => {
		const { src, placeholder, isUploading } = this.state;
		const { translate } = this.props;

		let image = null;
		if ( src && ! isUploading ) {
			image = (
				<figure>
					<MediaImage
						src={ src }
						alt={ translate( 'Variation thumbnail' ) }
						placeholder={ placeholder ? <img src={ placeholder } alt="" /> : <span /> }
					/>
				</figure>
			);
		} else if ( isUploading ) {
			image = (
				<figure>
					<img src={ placeholder || '' } alt="" />
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
				aria-label={ translate( 'Remove image' ) }
				className="products__product-form-variation-image-remove"
			>
				<Gridicon
					icon="cross"
					size={ 24 }
					className="products__product-form-variation-image-remove-icon"
				/>
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
					onFinish={ this.props.onUploadFinish }
				>
					{ image }
				</ProductImageUploader>
				{ removeButton }
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
