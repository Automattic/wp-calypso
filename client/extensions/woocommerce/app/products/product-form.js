/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

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
	};

	renderPlaceholder() {
		const { className } = this.props;
		return (
			<div className={ classNames( 'products__form', 'is-placeholder', className ) }>
				<div></div>
				<div></div>
				<div></div>
			</div>
		);
	}

	render() {
		const { siteId, product, productCategories, variations } = this.props;
		const { editProduct, editProductCategory, editProductVariation, editProductAttribute } = this.props;
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
