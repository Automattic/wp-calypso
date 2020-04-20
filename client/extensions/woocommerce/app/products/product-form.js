/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getProductsSettingValue } from 'woocommerce/state/sites/settings/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProductFormAdditionalDetailsCard from './product-form-additional-details-card';
import ProductFormCategoriesCard from './product-form-categories-card';
import ProductFormDetailsCard from './product-form-details-card';
import ProductFormSimpleCard from './product-form-simple-card';
import ProductFormVariationsCard from './product-form-variations-card';
import QuerySettingsProducts from 'woocommerce/components/query-settings-products';

class ProductForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			URL: PropTypes.string,
		} ),
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
		storeIsManagingStock: PropTypes.string,
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
		const {
			site,
			siteId,
			product,
			productCategories,
			variations,
			storeIsManagingStock,
		} = this.props;
		const {
			editProduct,
			editProductCategory,
			editProductVariation,
			editProductAttribute,
		} = this.props;
		const type = product.type || 'simple';

		if ( ! siteId || ! site ) {
			return this.renderPlaceholder();
		}

		return (
			<div className={ classNames( 'products__form', this.props.className ) }>
				<QuerySettingsProducts siteId={ siteId } />
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
					site={ site }
					siteId={ siteId }
					product={ product }
					variations={ variations }
					editProduct={ editProduct }
					editProductCategory={ editProductCategory }
					editProductAttribute={ editProductAttribute }
					editProductVariation={ editProductVariation }
					onUploadStart={ this.props.onUploadStart }
					onUploadFinish={ this.props.onUploadFinish }
					storeIsManagingStock={ storeIsManagingStock }
				/>

				{ 'simple' === type && (
					<div className="products__product-simple-cards">
						<ProductFormSimpleCard
							site={ site }
							siteId={ siteId }
							product={ product }
							editProduct={ this.props.editProduct }
							storeIsManagingStock={ storeIsManagingStock }
						/>
					</div>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	site: getSelectedSiteWithFallback( state ),
	storeIsManagingStock: getProductsSettingValue( state, 'woocommerce_manage_stock' ),
} ) )( ProductForm );
