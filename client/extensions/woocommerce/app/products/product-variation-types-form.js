/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { find, debounce, isNumber, indexOf, pull } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import TokenField from 'components/token-field';

class ProductVariationTypesForm extends Component {
	state = {
		attributeNames: {},
		attributeNameErrors: [],
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

	UNSAFE_componentWillMount() {
		const { product } = this.props;
		const attributes =
			( product.attributes && product.attributes.filter( ( attribute ) => attribute.variation ) ) ||
			[];
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
	};

	setAttributeNameError = ( id ) => {
		const attributeNameErrors = this.state.attributeNameErrors;
		if ( indexOf( attributeNameErrors, id ) === -1 ) {
			attributeNameErrors.push( id );
		}
		this.setState( { attributeNameErrors } );
	};

	removeAttributeNameError = ( id ) => {
		const attributeNameErrors = this.state.attributeNameErrors;
		pull( attributeNameErrors, id );
		this.setState( { attributeNameErrors } );
	};

	updateNameHandler = ( e ) => {
		const attributeNames = { ...this.state.attributeNames };
		attributeNames[ e.target.id ] = e.target.value;
		this.setState( { attributeNames } );
		this.debouncedUpdateName( e.target.id, e.target.value );
	};

	updateName( attributeId, name ) {
		const { siteId, product, editProductAttribute } = this.props;
		const attribute =
			product.attributes &&
			find( product.attributes, function ( a ) {
				return a.uid === attributeId;
			} );

		// Ensure we don't have an existing variation type with the same name.
		const existingAttribute =
			product.attributes &&
			find( product.attributes, function ( a ) {
				return a.uid !== attributeId && a.name.trim().toLowerCase() === name.trim().toLowerCase();
			} );

		if ( existingAttribute ) {
			this.setAttributeNameError( attributeId );
		} else {
			this.removeAttributeNameError( attributeId );
			editProductAttribute( siteId, product, attribute, { name } );
		}
	}

	updateValues = ( values, attribute ) => {
		const { siteId, product, editProductAttribute } = this.props;
		editProductAttribute( siteId, product, attribute, { options: values } );
	};

	renderInputs( attribute, index ) {
		const { translate } = this.props;
		const { attributeNames, attributeNameErrors } = this.state;

		const attributeName = ( attributeNames && attributeNames[ attribute.uid ] ) || attribute.name;
		const duplicateNameIssue = indexOf( attributeNameErrors, attribute.uid ) !== -1;
		const classes = classNames( 'products__variation-types-form-fieldset', {
			'is-error': duplicateNameIssue,
		} );
		return (
			<div key={ index }>
				<div className={ classes }>
					<FormTextInput
						placeholder={ translate( 'Color' ) }
						value={ attributeName }
						id={ attribute.uid }
						name="type"
						className="products__variation-types-form-field"
						isError={ duplicateNameIssue }
						onChange={ this.updateNameHandler }
					/>
					<TokenField
						placeholder={ translate( 'Red, Green, Blue' ) }
						value={ attribute.options }
						name="values"
						disabled={ duplicateNameIssue }
						/* eslint-disable react/jsx-no-bind */
						onChange={ ( values ) => this.updateValues( values, attribute ) }
					/>
				</div>
				{ duplicateNameIssue && (
					<FormInputValidation isError text={ translate( 'Variation type already exists.' ) } />
				) }
			</div>
		);
	}

	render() {
		const { product, translate } = this.props;
		const { attributes } = product;
		const variationTypes =
			( attributes && attributes.filter( ( attribute ) => attribute.variation ) ) || [];
		const inputs = variationTypes.map( this.renderInputs, this );

		return (
			<div className="products__variation-types-form-wrapper">
				{ ! isNumber( product.id ) && (
					<strong>{ translate( "Let's add some variations!" ) }</strong>
				) }
				<p>
					{ translate( 'Variations let you sell one item in various different options.', {
						components: { em: <em /> },
					} ) }
				</p>

				<div className="products__variation-types-form-group">
					<div className="products__variation-types-form-labels">
						<FormLabel className="products__variation-types-form-label">
							{ translate( 'Variation type' ) }
						</FormLabel>
						<FormLabel>{ translate( 'Values' ) }</FormLabel>
					</div>
					{ inputs }
				</div>

				<Button onClick={ this.addType }>{ translate( 'Add another variation' ) }</Button>
			</div>
		);
	}
}

export default localize( ProductVariationTypesForm );
