/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';
import clone from 'lodash/clone';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';
import TokenField from 'components/token-field';

export default class ProductsVariationTypesForm extends Component {

	static propTypes = {
		label: PropTypes.string,
		description: PropTypes.oneOfType( [
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
			PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) )
		] ),
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

	static defaultProps = {
		label: i18n.translate( 'Variation types' ),
		description: i18n.translate(
			'Let\'s add some variations! A common {{em}}variation type{{/em}} is color. The {{em}}values{{/em}} would be the colors the product is available in.',
			{ components: { em: <em /> } }
		),
	};

	constructor( props ) {
		super( props );

		this.state = {
			variations: this.props.variations ? this.props.variations : this.getInitialFields(),
			isVariation: props.product && 'variable' === props.product.type ? true : false,
		};

		this.addVariation = this.addVariation.bind( this );
		this.renderInputs = this.renderInputs.bind( this );
		this.handleToggle = this.handleToggle.bind( this );
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

	handleToggle() {
		this.setState( ( prevState ) => ( {
			isVariation: ! prevState.isVariation,
		} ) );
	}

	updateType( index, event ) {
		event.preventDefault();
		const newValue = event.target.value,
			updatedVariations = clone( this.state.variations );
		updatedVariations[ index ] = clone( updatedVariations[ index ] );
		updatedVariations[ index ].type = newValue;
		this.setState( { variations: updatedVariations } );
	}

	updateValues( index, value ) {
		const updatedVariations = clone( this.state.variations );
		updatedVariations[ index ] = clone( updatedVariations[ index ] );
		updatedVariations[ index ].values = value;
		this.setState( { variations: updatedVariations } );
	}

	renderInputs( variation, index ) {
		return (
			<div key={index} className="products-variation-types-form__fieldset">
				<FormTextInput
					placeholder={ i18n.translate( 'Color' ) }
					value={ variation.type }
					name="type"
					onChange={ this.updateType.bind( this, index ) }
					className="products-variation-types-form__field"
				/>
				<TokenField
					value={ variation.values }
					name="values"
					onChange={ this.updateValues.bind( this, index ) }
				/>
			</div>
		);
	}

	addVariation( event ) {
		event.preventDefault();
		const updatedVariations = this.state.variations.concat( [ this.getNewFields() ] );
		this.setState( { variations: updatedVariations } );
	}

	render() {
		const fields = this.state.variations,
			inputs = fields.map( this.renderInputs ),
			isNewProduct = this.props.product ? false : true;

		let variationsForm = null;
		if ( this.state.isVariation ) {
			variationsForm = (
				<div>
					<strong>{ this.props.label }</strong>
					<p>{ this.props.description }</p>

					<div className="products-variation-types-form__group">
						<div className="products-variation-types-form__labels">
							<FormLabel className="products-variation-types-form__label">{ i18n.translate( 'Variation type' ) }</FormLabel>
							<FormLabel>{ i18n.translate( 'Variation values' ) }</FormLabel>
						</div>
						{inputs}
					</div>

					<Button onClick={ this.addVariation }>{ i18n.translate( 'Add another variation' ) }</Button>
				</div>
			);
		}
		return (
			<div>
				<p>
					<FormToggle onChange={ this.handleToggle } checked={ this.state.isVariation }>
						{ isNewProduct ? i18n.translate( 'Does this product have options like size and color?' )
						: i18n.translate( 'Does %(productName)s have options like size and color?', {
							args: {
								productName: this.props.product.name,
							}
						} )
						}
					</FormToggle>
				</p>
				{variationsForm}
			</div>
		);
	}

}
