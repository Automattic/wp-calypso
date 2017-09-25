/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { assign } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
import { maskField, unmaskField } from 'lib/credit-card-details';
import CountrySelect from 'my-sites/domains/components/form/country-select';
import Input from 'my-sites/domains/components/form/input';

class CreditCardFormFields extends React.Component {
	static propTypes = {
		card: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		eventFormName: PropTypes.string.isRequired,
		isFieldInvalid: PropTypes.func.isRequired,
		onFieldChange: PropTypes.func.isRequired
	};

	field = ( fieldName, componentClass, props ) => {
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
	};

	getFieldValue = fieldName => {
		return this.props.card[ fieldName ];
	};

	handleFieldChange = event => {
		const { name: fieldName, value: nextValue } = event.target;

		const previousValue = this.getFieldValue( fieldName );

		const rawDetails = {
			[ fieldName ]: unmaskField( fieldName, previousValue, nextValue )
		};

		const maskedDetails = {
			[ fieldName ]: maskField( fieldName, previousValue, nextValue )
		};

		this.props.onFieldChange( rawDetails, maskedDetails );
	};

	render() {
		return (
		    <div className="credit-card-form-fields">
				{ this.field( 'name', Input, {
					labelClass: 'credit-card-form-fields__label',
					autoFocus: true,
					label: this.props.translate( 'Name on Card', {
						context: 'Card holder name label on credit card form'
					} )
				} ) }

				{ this.field( 'number', CreditCardNumberInput, {
					inputMode: 'numeric',
					labelClass: 'credit-card-form-fields__label',
					label: this.props.translate( 'Card Number', {
						context: 'Card number label on credit card form'
					} )
				} ) }

				<div className="credit-card-form-fields__extras">
					{ this.field( 'expiration-date', Input, {
						inputMode: 'numeric',
						labelClass: 'credit-card-form-fields__label',
						label: this.props.translate( 'MM/YY', {
							context: 'Expiry label on credit card form'
						} )
					} ) }

					{ this.field( 'cvv', Input, {
						inputMode: 'numeric',
						labelClass: 'credit-card-form-fields__label',
						label: this.props.translate( 'CVV', {
							context: '3 digit security number on credit card form'
						} )
					} ) }

					{ this.field( 'country', CountrySelect, {
						label: this.props.translate( 'Country' ),
						countriesList: this.props.countriesList
					} ) }

					{ this.field( 'postal-code', Input, {
						labelClass: 'credit-card-form-fields__label',
						label: this.props.translate( 'Postal Code', {
							context: 'Postal code on credit card form'
						} )
					} ) }
				</div>
			</div>
		);
	}
}

export default localize( CreditCardFormFields );
