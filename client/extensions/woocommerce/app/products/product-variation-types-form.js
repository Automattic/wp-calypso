/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';
import TokenField from 'components/token-field';

export default class ProductVariationTypesForm extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
			attributes: PropTypes.array,
		} ),
		editProductAttribute: PropTypes.func.isRequired,
	};

	componentWillMount() {
		const { product } = this.props;

		if ( ! product.attributes ) {
			this.addType();
		}
	}

	constructor( props ) {
		super( props );

		this.addType = this.addType.bind( this );
		this.updateName = this.updateName.bind( this );
		this.updateValues = this.updateValues.bind( this );
	}

	getNewFields() {
		return {
			name: '',
			options: [],
			variation: true,
		};
	}

	addType() {
		const { product, editProductAttribute } = this.props;
		editProductAttribute( product, null, this.getNewFields() );
	}

	updateName( e ) {
		const { product, editProductAttribute } = this.props;
		const attribute = product.attributes && find( product.attributes, function( a ) {
			return a.uid === e.target.id;
		} );
		editProductAttribute( product, attribute, { name: e.target.value } );
	}

	updateValues( values, attribute ) {
		const { product, editProductAttribute } = this.props;
		editProductAttribute( product, attribute, { options: values } );
	}

	renderInputs( attribute ) {
		return (
			<div key={ attribute.uid } className="products__variation-types-form-fieldset">
				<FormTextInput
					placeholder={ i18n.translate( 'Color' ) }
					value={ attribute.name }
					id={ attribute.uid }
					name="type"
					className="products__variation-types-form-field"
					onChange={ this.updateName }
				/>
				<TokenField
					placeholder={ i18n.translate( 'Comma separate these' ) }
					value={ attribute.options }
					name="values"
					/* eslint-disable react/jsx-no-bind */
					onChange={ ( values ) => this.updateValues( values, attribute ) }
				/>
			</div>
		);
	}

	render() {
		const { product } = this.props;
		const { attributes } = product;
		const variationTypes = ( attributes && attributes.filter( attribute => attribute.variation ) ) || [];
		const inputs = variationTypes.map( this.renderInputs, this );

		return (
			<div className="products__variation-types-form-wrapper">
				<strong>{ i18n.translate( 'Variation types' ) }</strong>
				<p>
					{ i18n.translate(
						'Let\'s add some variations! A common {{em}}variation type{{/em}} is color. ' +
						'The {{em}}values{{/em}} would be the colors the product is available in.',
						{ components: { em: <em /> } }
					) }
				</p>

				<div className="products__variation-types-form-group">
					<div className="products__variation-types-form-labels">
						<FormLabel className="products__variation-types-form-label">{ i18n.translate( 'Variation type' ) }</FormLabel>
						<FormLabel>{ i18n.translate( 'Variation values' ) }</FormLabel>
					</div>
					{inputs}
				</div>

				<Button onClick={ this.addType }>{ i18n.translate( 'Add another variation' ) }</Button>
		</div>
		);
	}

}
