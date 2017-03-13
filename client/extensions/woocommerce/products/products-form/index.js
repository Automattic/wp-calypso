/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ProductsVariationTypesForm from '../products-variation-types-form';

export default class ProductsForm extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} )
	};

	render() {
		return (
			<Card>
				<ProductsVariationTypesForm />
			</Card>
		);
	}

}
