/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ProductFormAdditionalDetailsCard from './product-form-additional-details-card';
import ProductFormCategoriesCard from './product-form-categories-card';
import ProductFormDetailsCard from './product-form-details-card';
import ProductFormSimpleCard from './product-form-simple-card';
import ProductFormVariationsCard from './product-form-variations-card';

export default class ProductForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
		} ),
		variations: PropTypes.array,
		productCategories: PropTypes.array.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	render() {
		const { product, productCategories, variations } = this.props;
		const { editProduct, editProductVariation, editProductAttribute } = this.props;

		return (
			<div className={ classNames( 'products__form', this.props.className ) }>
				<ProductFormDetailsCard
					product={ product }
					editProduct={ editProduct }
				/>
				<ProductFormAdditionalDetailsCard
					product={ product }
					editProduct={ this.props.editProduct }
					editProductAttribute={ this.props.editProductAttribute }
				/>
				<ProductFormCategoriesCard
					product={ product }
					productCategories={ productCategories }
					editProduct={ editProduct }
				/>
				<ProductFormVariationsCard
					product={ product }
					variations={ variations }
					editProduct={ editProduct }
					editProductAttribute={ editProductAttribute }
					editProductVariation={ editProductVariation }
				/>

				{ 'simple' === product.type && (
					<div className="products__product-simple-cards">
						<ProductFormSimpleCard
							product={ product }
							editProduct={ this.props.editProduct }
						/>
					</div>
				) }
			</div>
		);
	}

}
