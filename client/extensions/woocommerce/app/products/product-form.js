/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ProductFormCategoriesCard from './product-form-categories-card';
import ProductFormDetailsCard from './product-form-details-card';
import ProductFormVariationsCard from './product-form-variations-card';

export default class ProductForm extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
		} ),
		productCategories: PropTypes.array.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	render() {
		const { product, productCategories } = this.props;
		const { editProduct, editProductAttribute } = this.props;

		return (
			<div className="woocommerce products__form">
				<ProductFormDetailsCard
					product={ product }
					editProduct={ editProduct }
				/>

				<ProductFormCategoriesCard
					product={ product }
					productCategories={ productCategories }
					editProduct={ editProduct }
				/>

				<ProductFormVariationsCard
					product={ product }
					editProduct={ editProduct }
					editProductAttribute={ editProductAttribute }
				/>
			</div>
		);
	}

}
