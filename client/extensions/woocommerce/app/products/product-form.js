/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ProductFormDetailsCard from './product-form-details-card';
import ProductFormVariationsCard from './product-form-variations-card';

export default class ProductForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
		} ),
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	render() {
		const { product } = this.props;
		return (
			<div className={ classNames( 'products__form', this.props.className ) }>
				<ProductFormDetailsCard
					product={ product }
					editProduct={ this.props.editProduct }
				/>

				<ProductFormVariationsCard
					product={ product }
					editProduct={ this.props.editProduct }
					editProductAttribute={ this.props.editProductAttribute }
				/>
			</div>
		);
	}

}
