/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ProductFormDetailsCard from './product-form-details-card';
import ProductFormVariationsCard from './product-form-variations-card';
import ProductFormDeliveryDetailsCard from './product-form-delivery-details-card';

export default class ProductForm extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
		} ),
		variations: PropTypes.array,
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
		editProductVariation: PropTypes.func.isRequired,
	};

	render() {
		const { product, variations, editProductVariation } = this.props;
		return (
			<div className="woocommerce products__form">
				<ProductFormDetailsCard
					product={ product }
					editProduct={ this.props.editProduct }
				/>

				<ProductFormVariationsCard
					product={ product }
					variations={ variations }
					editProduct={ this.props.editProduct }
					editProductAttribute={ this.props.editProductAttribute }
					editProductVariation={ editProductVariation }
				/>

				{ 'simple' === product.type && (
					<ProductFormDeliveryDetailsCard
						product={ product }
						editProduct={ this.props.editProduct }
					/>
				) }
			</div>
		);
	}

}
