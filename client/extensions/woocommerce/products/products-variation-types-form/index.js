/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';
import Button from 'components/button';

class ProductsVariationTypesForm extends Component {

	render() {
		return(
			<div>
				<p>
					<FormLabel>{ i18n.translate( 'Variation type' ) }</FormLabel>
					<FormInput placeholder={ i18n.translate( 'Color' ) } />
				</p>

				<Button>{ i18n.translate( 'Add another option' ) }</Button>
			</div>
		);
	}

}

export default ProductsVariationTypesForm;
