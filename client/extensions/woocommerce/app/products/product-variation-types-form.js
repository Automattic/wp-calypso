/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';
import TokenField from 'components/token-field';

export default class ProductVariationTypesForm extends Component {

	static propTypes = {
		product: PropTypes.object.isRequired,
		editProduct: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.addVariationType = this.addVariationType.bind( this );
		this.updateType = this.updateType.bind( this );
		this.updateValues = this.updateValues.bind( this );
	}

	getNewFields() {
		return {
			type: '',
			values: [],
		};
	}

	addVariationType() {
		const updatedVariations = [ ...this.props.product.variationTypes, this.getNewFields() ];
		this.props.editProduct( this.props.product.id, 'variationTypes', updatedVariations );
	}

	updateType( index, event ) {
		const updatedVariations = [ ...this.props.product.variationTypes ];
		updatedVariations[ index ] = { ...updatedVariations[ index ], type: event.target.value };
		this.props.editProduct( this.props.product.id, 'variationTypes', updatedVariations );
	}

	updateValues( index, value ) {
		const updatedVariations = [ ...this.props.product.variationTypes ];
		updatedVariations[ index ] = { ...updatedVariations[ index ], values: value };
		this.props.editProduct( this.props.product.id, 'variationTypes', updatedVariations );
	}

	renderInputs( variation, index ) {
		const _updateType = ( e ) => this.updateType( index, e );
		const _updateValues = ( value ) => this.updateValues( index, value );
		return (
			<div key={index} className="product-variation-types-form__fieldset">
				<FormTextInput
					placeholder={ i18n.translate( 'Color' ) }
					value={ variation.type }
					name="type"
					onChange={ _updateType }
					className="product-variation-types-form__field"
				/>
				<TokenField
					placeholder={ i18n.translate( 'Comma separate these' ) }
					value={ variation.values }
					name="values"
					onChange={ _updateValues }
				/>
			</div>
		);
	}

	render() {
		const { product } = this.props;
		const inputs = product.variationTypes.map( this.renderInputs, this );
		return (
			<div className="product-variation-types-form__wrapper">
				<strong>{ i18n.translate( 'Variation types' ) }</strong>
				<p>
					{ i18n.translate(
						'Let\'s add some variations! A common {{em}}variation type{{/em}} is color. The {{em}}values{{/em}} would be the colors the product is available in.',
						{ components: { em: <em /> } }
					) }
				</p>

				<div className="product-variation-types-form__group">
					<div className="product-variation-types-form__labels">
						<FormLabel className="product-variation-types-form__label">{ i18n.translate( 'Variation type' ) }</FormLabel>
						<FormLabel>{ i18n.translate( 'Variation values' ) }</FormLabel>
					</div>
					{inputs}
				</div>

				<Button onClick={ this.addVariationType }>{ i18n.translate( 'Add another variation' ) }</Button>
		</div>
		);
	}

}
