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
		product: PropTypes.shape( {
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		variations: PropTypes.arrayOf( PropTypes.shape( {
			type: PropTypes.string.isRequired,
			values: PropTypes.arrayOf( PropTypes.string )
		} ) ),
	};

	constructor( props ) {
		super( props );

		this.state = {
			variations: this.props.variations || this.getInitialFields(),
		};

		this.addVariation = this.addVariation.bind( this );
		this.updateType = this.updateType.bind( this );
		this.updateValues = this.updateValues.bind( this );
	}

	getInitialFields() {
		return [ this.getNewFields() ];
	}

	getNewFields() {
		return {
			type: '',
			values: [],
		};
	}

	updateType( index, event ) {
		event.preventDefault();
		const updatedVariations = [ ...this.state.variations ];
		updatedVariations[ index ] = { ...updatedVariations[ index ], type: event.target.value };
		this.setState( { variations: updatedVariations } );
	}

	updateValues( index, value ) {
		const updatedVariations = [ ...this.state.variations ];
		updatedVariations[ index ] = { ...updatedVariations[ index ], values: value };
		this.setState( { variations: updatedVariations } );
	}

	renderInputs( variation, index ) {
		return (
			<div key={ index } className="products__variation-types-form-fieldset">
				<FormTextInput
					placeholder={ i18n.translate( 'Color' ) }
					value={ variation.type }
					name="type"
					onChange={ ( e ) => this.updateType( index, e ) }
					className="products__variation-types-form-field"
				/>
				<TokenField
					placeholder={ i18n.translate( 'Comma separate these' ) }
					value={ variation.values }
					name="values"
					onChange={ ( value ) => this.updateValues( index, value ) }
				/>
			</div>
		);
	}

	addVariation( event ) {
		event.preventDefault();
		const updatedVariations = [ ...this.state.variations, this.getNewFields() ];
		this.setState( { variations: updatedVariations } );
	}

	render() {
		const inputs = this.state.variations.map( this.renderInputs, this );
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

				<Button onClick={ this.addVariation }>{ i18n.translate( 'Add another variation' ) }</Button>
		</div>
		);
	}

}
