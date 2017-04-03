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
		addVariation: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.addVariationType = this.addVariationType.bind( this );
		this.updateVariations = this.updateVariations.bind( this );
		this.updateType = this.updateType.bind( this );
		this.updateValues = this.updateValues.bind( this );
	}

	getNewFields() {
		return {
			type: '',
			values: [],
		};
	}

	addVariationType( event ) {
		event.preventDefault();
		const updatedVariations = [ ...this.props.product.variationTypes, this.getNewFields() ];
		this.props.editProduct( null, 'variationTypes', updatedVariations );
	}

	updateType( index, event ) {
		event.preventDefault();
		const updatedVariations = [ ...this.props.product.variationTypes ];
		updatedVariations[ index ] = { ...updatedVariations[ index ], type: event.target.value };
		this.props.editProduct( null, 'variationTypes', updatedVariations );
	}

	updateValues( index, value ) {
		const updatedVariations = [ ...this.props.product.variationTypes ];
		updatedVariations[ index ] = { ...updatedVariations[ index ], values: value };
		this.props.editProduct( null, 'variationTypes', updatedVariations );
	}

	/*
	 * Given a set of variationTypes and a product's exisiting variations,
	 * return new variation entires for those that need to be created.
	 * Both variationTypes and currentVariations should come from the product object.
	 * The format of the variations with their attribute data matches the output of
	 * the REST API.
	 */
	generateVariations( variationTypes = [], currentVariations = [] ) {
		const possibleValues = [];
		const indexesToLabels = [];
		const possibleVariations = [];
		const existingVariations = [];
		const variations = [];

		/*
		 * Create an array of each set of possible values for a specific type
		 * so that we can generate a new cartesian of products.
		 * We also need to store a relation of indexes to the type label so we can
		 * properly build new variation objects later.
		*/
		variationTypes.map( function( variationType ) {
			if ( variationType.type.length > 0 && variationType.values.length > 0 ) {
				possibleValues.push( variationType.values );
				indexesToLabels.push( variationType.type );
			}
		} );

		/*
		 * Generate a full list of valid variations based on the types avaiable.
		 * http://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
		 */
		const f = ( a, b ) => [].concat( ...a.map( c => b.map( d => [].concat( c, d ) ) ) );
		const cartesian = ( a, b, ...c ) => b ? cartesian( f( a, b ), ...c ) : a;
		cartesian( ...possibleValues ).map( function( entry ) {
			possibleVariations.push( entry.join( ' - ' ) );
		} );

		/*
		 * Loop through existing product variations returned by the API.
		 * Format based on API:
		 * product.variations is an array of variation objects.
		 * Each variation has an id, name, and option.
		 */
		currentVariations.map( function( variation ) {
			const attributes = Array();
			variation.attributes.map( function( attribute ) {
				attributes.push( attribute.option );
			} );
			existingVariations.push( attributes.join( ' - ' ) );
		} );

		// Generate a list of new variations based on those that do not exist.
		const newVariations = possibleVariations.filter( x => existingVariations.indexOf( x ) === -1 );

		newVariations.map( function( newVariationName ) {
			const attributes = Array();
			newVariationName.split( ' - ' ).map( function( option, index ) {
				const attribute = Array( 3 );
				attribute.id = 0; // default for product level attributes in WC
				attribute.name = indexesToLabels[ index ]; // Name (like 'Size' or 'Color')
				attribute.option = option;
				attributes.push( attribute );
			} );
			variations.push( {
				name: newVariationName,
				attributes,
			} );
		} );

		return variations;
	}

	updateVariations() {
		const { props } = this;
		const newVariations = this.generateVariations( props.product.variationTypes, props.product.variations || [] );
		newVariations.map( function( newVariation ) {
			props.addVariation( null, newVariation );
		} );
	}

	renderInputs( variation, index ) {
		const _updateType = ( e ) => this.updateType( index, e );
		const _updateValues = ( value ) => this.updateValues( index, value );
		return (
			<div key={ index } className="product-variation-types-form__fieldset">
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
		if ( ! product.variationTypes ) {
			product.variationTypes = [ this.getNewFields() ];
		}

		let updateVariationsText = i18n.translate( 'Update Variations' );
		if ( ! product.variations ) {
			updateVariationsText = i18n.translate( 'Create Variations' );
		}

		const inputs = product.variationTypes.map( this.renderInputs, this );

		return (
			<div className="product-variation-types-form">
				<strong>{ i18n.translate( 'Variation types' ) }</strong>
				<p>
					{ i18n.translate(
						'Let\'s add some variations! A common {{em}}variation type{{/em}} is color. ' +
						'The {{em}}values{{/em}} would be the colors the product is available in.',
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

				<Button onClick={ this.addVariationType }>{ i18n.translate( 'Add another variation type' ) }</Button>
				<Button onClick={ this.updateVariations }>{ updateVariationsText }</Button>
		</div>
		);
	}

}
