/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getProductEdits } from 'woocommerce/state/ui/products/selectors';
import { getProductVariationsWithLocalEdits } from 'woocommerce/state/ui/products/variations/selectors';
import { getProductCategoriesWithLocalEdits } from 'woocommerce/state/ui/product-categories/selectors';
import ProductFormAdditionalDetailsCard from './product-form-additional-details-card';
import ProductFormCategoriesCard from './product-form-categories-card';
import ProductFormDetailsCard from './product-form-details-card';
import ProductFormSimpleCard from './product-form-simple-card';
import ProductFormVariationsCard from './product-form-variations-card';
import { SECOND } from 'woocommerce/rest-api-client/constants';
import withApiClient from 'woocommerce/rest-api-client/with-api-client';

class ProductForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string,
			name: PropTypes.string,
		} ),
		variations: PropTypes.array,
		productCategories: PropTypes.array.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductCategory: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
		onUploadStart: PropTypes.func.isRequired,
		onUploadFinish: PropTypes.func.isRequired,
	};

	renderPlaceholder() {
		const { className } = this.props;
		return (
			<div className={ classNames( 'products__form', 'is-placeholder', className ) }>
				<div />
				<div />
				<div />
			</div>
		);
	}

	render() {
		const { siteId, product, productCategories, variations } = this.props;
		const {
			editProduct,
			editProductCategory,
			editProductVariation,
			editProductAttribute,
		} = this.props;
		const type = product.type || 'simple';

		if ( ! siteId ) {
			return this.renderPlaceholder();
		}

		return (
			<div className={ classNames( 'products__form', this.props.className ) }>
				<ProductFormDetailsCard
					siteId={ siteId }
					product={ product }
					editProduct={ editProduct }
					onUploadStart={ this.props.onUploadStart }
					onUploadFinish={ this.props.onUploadFinish }
				/>
				<ProductFormAdditionalDetailsCard
					siteId={ siteId }
					product={ product }
					editProduct={ this.props.editProduct }
					editProductAttribute={ this.props.editProductAttribute }
				/>
				<ProductFormCategoriesCard
					siteId={ siteId }
					product={ product }
					productCategories={ productCategories }
					editProduct={ editProduct }
					editProductCategory={ editProductCategory }
				/>
				<ProductFormVariationsCard
					siteId={ siteId }
					product={ product }
					variations={ variations }
					editProduct={ editProduct }
					editProductCategory={ editProductCategory }
					editProductAttribute={ editProductAttribute }
					editProductVariation={ editProductVariation }
					onUploadStart={ this.props.onUploadStart }
					onUploadFinish={ this.props.onUploadFinish }
				/>

				{ 'simple' === type && (
					<div className="products__product-simple-cards">
						<ProductFormSimpleCard
							siteId={ siteId }
							product={ product }
							editProduct={ this.props.editProduct }
						/>
					</div>
				) }
			</div>
		);
	}
}

function mapApiToProps( apiClient, ownProps, state ) {
	const { siteId, productId } = ownProps;
	const apiProduct = apiClient.selectors.getProduct( productId, { freshness: 30 * SECOND } );
	const edits = getProductEdits( state, productId, siteId );
	const product = { ...apiProduct, ...edits };

	// TODO: Move this over to `siteData`
	const variations = product && getProductVariationsWithLocalEdits( state, productId );

	// TODO: Move this over to `siteData`
	const productCategories = getProductCategoriesWithLocalEdits( state );

	return {
		product,
		variations,
		productCategories,
	};
}

export default withApiClient( 'woocommerce', mapApiToProps, 'siteId' )( ProductForm );
