import { assign } from 'lodash';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import CountrySelect from 'my-sites/domains/components/form/country-select';
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
import Input from 'my-sites/domains/components/form/input';
import { maskField, unmaskField } from 'lib/credit-card-details';

const CreditCardFormFields = React.createClass( {
	propTypes: {
		card: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		eventFormName: PropTypes.string.isRequired,
		isFieldInvalid: PropTypes.func.isRequired,
		onFieldChange: PropTypes.func.isRequired
	},

	field: function( fieldName, componentClass, props ) {
		return React.createElement( componentClass, assign( {}, props, {
			additionalClasses: 'credit-card-form-fields__field',
			eventFormName: this.props.eventFormName,
			isError: this.props.isFieldInvalid( fieldName ),
			name: fieldName,
			onBlur: this.handleFieldChange,
			onChange: this.handleFieldChange,
			value: this.getFieldValue( fieldName ),
			autoComplete: 'off'
		} ) );
	},

	getFieldValue: function( fieldName ) {
		return this.props.card[ fieldName ];
	},

	handleFieldChange: function( event ) {
		const { name: fieldName, value: nextValue } = event.target;

		const previousValue = this.getFieldValue( fieldName );

		const rawDetails = {
			[ fieldName ]: unmaskField( fieldName, previousValue, nextValue )
		};

		const maskedDetails = {
			[ fieldName ]: maskField( fieldName, previousValue, nextValue )
		};

		this.props.onFieldChange( rawDetails, maskedDetails );
	},

	render: function() {
		return (
			<div className="credit-card-form-fields">
				{ this.field( 'name', Input, {
					labelClass: 'credit-card-form-fields__label',
					autoFocus: true,
					label: this.translate( 'Name on Card', {
						context: 'Card holder name label on credit card form'
					} )
				} ) }

				{ this.field( 'number', CreditCardNumberInput, {
					inputMode: 'numeric',
					labelClass: 'credit-card-form-fields__label',
					label: this.translate( 'Card Number', {
						context: 'Card number label on credit card form'
					} )
				} ) }

				<div className="credit-card-form-fields__extras">
					{ this.field( 'expiration-date', Input, {
						inputMode: 'numeric',
						labelClass: 'credit-card-form-fields__label',
						label: this.translate( 'MM/YY', {
							context: 'Expiry label on credit card form'
						} )
					} ) }

					{ this.field( 'cvv', Input, {
						inputMode: 'numeric',
						labelClass: 'credit-card-form-fields__label',
						label: this.translate( 'CVV', {
							context: '3 digit security number on credit card form'
						} )
					} ) }

					{ this.field( 'country', CountrySelect, {
						label: this.translate( 'Country' ),
						countriesList: this.props.countriesList
					} ) }

					{ this.field( 'postal-code', Input, {
						labelClass: 'credit-card-form-fields__label',
						label: this.translate( 'Postal Code', {
							context: 'Postal code on credit card form'
						} )
					} ) }
				</div>
			</div>
		);
	}
} );

export default CreditCardFormFields;
