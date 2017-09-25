/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find, debounce, isNumber } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import TokenField from 'components/token-field';

class ProductVariationTypesForm extends Component {

	state = {
		attributeNames: {},
	};

	static propTypes = {
		siteId: PropTypes.number,
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

		const attributes = ( product.attributes && product.attributes.filter( attribute => attribute.variation ) ) || [];
		if ( ! attributes.length ) {
			this.addType();
		}

		this.debouncedUpdateName = debounce( this.updateName, 300 );
	}

	getNewFields() {
		return {
			name: '',
			options: [],
			variation: true,
		};
	}

	addType = () => {
		const { siteId, product, editProductAttribute } = this.props;
		editProductAttribute( siteId, product, null, this.getNewFields() );
	}

	updateNameHandler = ( e ) => {
		const attributeNames = { ...this.state.attributeNames };
		attributeNames[ e.target.id ] = e.target.value;
		this.setState( { attributeNames } );
		this.debouncedUpdateName( e.target.id, e.target.value );
	}

	updateName( attributeId, name ) {
		const { siteId, product, editProductAttribute } = this.props;
		const attribute = product.attributes && find( product.attributes, function( a ) {
			return a.uid === attributeId;
		} );
		editProductAttribute( siteId, product, attribute, { name } );
	}

	updateValues = ( values, attribute ) => {
		const { siteId, product, editProductAttribute } = this.props;
		editProductAttribute( siteId, product, attribute, { options: values } );
	}

	renderInputs( attribute, index ) {
		const { translate } = this.props;
		const { attributeNames } = this.state;
		const attributeName = attributeNames && attributeNames[ attribute.uid ] || attribute.name;
		return (
			<div key={ index } className="products__variation-types-form-fieldset">
				<FormTextInput
					placeholder={ translate( 'Color' ) }
					value={ attributeName }
					id={ attribute.uid }
					name="type"
					className="products__variation-types-form-field"
					onChange={ this.updateNameHandler }
				/>
				<TokenField
					placeholder={ translate( 'Red, Green, Blue' ) }
					value={ attribute.options }
					name="values"
					/* eslint-disable react/jsx-no-bind */
					onChange={ ( values ) => this.updateValues( values, attribute ) }
				/>
			</div>
		);
	}

	render() {
		const { product, translate } = this.props;
		const { attributes } = product;
		const variationTypes = ( attributes && attributes.filter( attribute => attribute.variation ) ) || [];
		const inputs = variationTypes.map( this.renderInputs, this );

		return (
			<div className="products__variation-types-form-wrapper">
				{ ! isNumber( product.id ) && ( <strong>{ translate( 'Let\'s add some variations!' ) }</strong> ) }
				<p>
					{ translate(
						'Variations let you sell one item in various different options.',
						{ components: { em: <em /> } }
					) }
				</p>

				<div className="products__variation-types-form-group">
					<div className="products__variation-types-form-labels">
						<FormLabel className="products__variation-types-form-label">{ translate( 'Variation type' ) }</FormLabel>
						<FormLabel>{ translate( 'Values' ) }</FormLabel>
					</div>
					{inputs}
				</div>

				<Button onClick={ this.addType }>{ translate( 'Add another variation' ) }</Button>
		</div>
		);
	}

}

export default localize( ProductVariationTypesForm );
