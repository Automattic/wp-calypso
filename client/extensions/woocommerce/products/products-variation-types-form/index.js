/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';
import Button from 'components/button';
import TokenField from 'components/token-field';

class ProductsVariationTypesForm extends Component {

	render() {
		return(
			<div>
				<strong>{ this.props.label }</strong>
				<p>{ this.props.description }</p>

				<div className="product-variation-types__fieldset-group">

					<fieldset className="product-variation-types__fieldset">
						<FormLabel>{ i18n.translate( 'Variation type' ) }</FormLabel>
						{ this.props.variations.map( ( variation, index ) =>
							<FormInput placeholder={ i18n.translate( 'Color' ) } value={ variation.type } key={ index } />
						) }
					</fieldset>

					<fieldset className="product-variation-types__fieldset">
						<FormLabel>{ i18n.translate( 'Variation values' ) }</FormLabel>
						{ this.props.variations.map( ( variation, index ) =>
							<TokenField key={ index } value={ variation.values } />
						) }
					</fieldset>


				</div>

				<Button>{ i18n.translate( 'Add another variation' ) }</Button>
			</div>
		);
	}

}

ProductsVariationTypesForm.propTypes = {
	label: PropTypes.string,
	description: PropTypes.oneOfType( [
		PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) )
	] ),
	variations: PropTypes.arrayOf( PropTypes.shape( {
		type: PropTypes.string.isRequired,
		values: PropTypes.arrayOf( PropTypes.string )
	} ) ),
};

ProductsVariationTypesForm.defaultProps =  {
	label: i18n.translate( 'Variation types' ),
	description: i18n.translate(
		'Let\'s add some variations! A common {{em}}variation type{{/em}} is color. The {{em}}values{{/em}} would be the colors the product is available in.',
		{ components: { em: <em /> } }
	),
	variations: Object.freeze( [ { type: '', values: [] } ] ),
};

export default ProductsVariationTypesForm;
