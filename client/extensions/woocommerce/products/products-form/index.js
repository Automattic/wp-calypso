/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';
import ProductVariationTypesForm from '../products-variation-types-form';

class ProductsForm extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		} )
	};

	render() {
		const isNewProduct = this.props.product ? false : true;
		return (
			<Card>
				<p>
				<FormLabel>
					{ isNewProduct ? i18n.translate( 'Does this product have options like size and color?' )
						: i18n.translate( 'Does %(productName)s have options like size and color?', {
							args: {
								productName: this.props.product.name,
							}
						} )
					}
				</FormLabel>
				<FormToggle />
				</p>

				<ProductVariationTypesForm
					variations={ [ { type: 'Color', values: [ 'Red' ] } ] }
				/>
			</Card>
		);
	}

}

export default ProductsForm;
