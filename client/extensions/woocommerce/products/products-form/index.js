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

export default class ProductsForm extends Component {

	constructor( props ) {
		super(props);
		this.state = { productType: props.product ? props.product.productType : 'simple' };
		this.handleToggle = this.handleToggle.bind(this);
	}

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			productType: PropTypes.string.isRequired,
		} )
	};

	handleToggle() {
		this.setState( ( prevState, props ) => ( {
			productType: 'variable' === prevState.productType ? 'simple' : 'variable'
		}  )  );
	}

	render() {
		const isNewProduct = this.props.product ? false : true;
		let variationsForm = null;

		if ( 'variable' === this.state.productType ) {
			variationsForm = <ProductVariationTypesForm variations={ [ { type: 'Color', values: [ 'Red' ] } ] } />
		}

		return (
			<Card>
				<p>
				<FormToggle onChange={ this.handleToggle } checked={ 'variable' === this.state.productType }>{ isNewProduct ? i18n.translate( 'Does this product have options like size and color?' )
					: i18n.translate( 'Does %(productName)s have options like size and color?', {
						args: {
							productName: this.props.product.name,
						}
					} )
				}</FormToggle>
				</p>


				{variationsForm}
			</Card>
		);
	}

}
