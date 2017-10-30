/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { assign } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
import { CountrySelect, StateSelect, Input } from 'my-sites/domains/components/form';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { maskField, unmaskField } from 'lib/credit-card-details';
import config from 'config';

export class CreditCardFormFields extends React.Component {
	static propTypes = {
		card: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		eventFormName: PropTypes.string.isRequired,
		isFieldInvalid: PropTypes.func.isRequired,
		onFieldChange: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			countryCode: '',
			phoneCountryCode: '',
		};
	}

	createField = ( fieldName, componentClass, props ) => {
		return React.createElement(
			componentClass,
			assign(
				{},
				{
					additionalClasses: 'credit-card-form-fields__field',
					eventFormName: this.props.eventFormName,
					isError: this.props.isFieldInvalid( fieldName ),
					name: fieldName,
					onBlur: this.handleFieldChange,
					onChange: this.handleFieldChange,
					value: this.getFieldValue( fieldName ),
					autoComplete: 'off',
				},
				props
			)
		);
	};

	getFieldValue = fieldName => {
		return this.props.card[ fieldName ] || '';
	};

	handlePhoneFieldChange = ( { value, countryCode } ) => {
		// eslint-disable-next-line
		console.log( value, countryCode );
		this.setState( {
			phoneCountryCode: countryCode,
		} );
	};

	handleFieldChange = event => {
		const { name: fieldName, value: nextValue } = event.target;

		const previousValue = this.getFieldValue( fieldName );

		const rawDetails = {
			[ fieldName ]: unmaskField( fieldName, previousValue, nextValue ),
		};

		const maskedDetails = {
			[ fieldName ]: maskField( fieldName, previousValue, nextValue ),
		};

		this.props.onFieldChange( rawDetails, maskedDetails );

		if ( fieldName === 'country' ) {
			const newState = {
				countryCode: nextValue,
			};
			if ( ! this.state.phoneCountryCode ) {
				newState.phoneCountryCode = nextValue;
			}
			this.setState( newState );
		}
	};

	shouldRenderEbanx() {
		const { countryCode } = this.state;
		return countryCode === 'BR' && config.isEnabled( 'upgrades/ebanx' );
	}

	renderEbanksFields() {
		const { translate, countriesList } = this.props;
		const { countryCode, phoneCountryCode } = this.state;
		return [
			this.createField( 'document', Input, {
				label: translate( 'Taxpayer Identification Number', {
					context:
						'Individual taxpayer registry identification required ' +
						'for Brazilian payment methods using EBANX on credit card form',
				} ),
				key: 'document',
			} ),

			this.createField( 'phone', FormPhoneMediaInput, {
				onChange: this.handlePhoneFieldChange,
				onBlur: this.handlePhoneFieldChange,
				countriesList: countriesList,
				countryCode: phoneCountryCode,
				label: translate( 'Phone' ),
				key: 'phone',
			} ),

			this.createField( 'address', Input, {
				maxLength: 40,
				labelClass: 'credit-card-form-fields__label',
				label: translate( 'Address' ),
				key: 'address',
			} ),

			this.createField( 'street-number', Input, {
				inputMode: 'numeric',
				label: translate( 'Street number', {
					context: 'Street number associated with address on credit card form',
				} ),
				key: 'street-number',
			} ),

			this.createField( 'city', Input, {
				labelClass: 'credit-card-form-fields__label',
				label: translate( 'City' ),
				key: 'city',
			} ),

			<div className="credit-card-form-fields__state-field" key="state">
				{ this.createField( 'state', StateSelect, {
					countryCode: countryCode,
					label: translate( 'State' ),
				} ) }
			</div>,
		];
	}

	render() {
		const { translate, countriesList, card } = this.props;
		const ebanxDetailsRequired = this.shouldRenderEbanx();
		const creditCardFormFieldsExtrasClassNames = classNames( {
			'credit-card-form-fields__extras': true,
			'ebanx-details-required': ebanxDetailsRequired,
		} );
		// eslint-disable-next-line
		console.log( 'card', card );
		return (
			<div className="credit-card-form-fields">
				{ this.createField( 'name', Input, {
					autoFocus: true,
					label: translate( 'Name on Card', {
						context: 'Card holder name label on credit card form',
					} ),
				} ) }

				{ this.createField( 'number', CreditCardNumberInput, {
					inputMode: 'numeric',
					label: translate( 'Card Number', {
						context: 'Card number label on credit card form',
					} ),
				} ) }

				<div className={ creditCardFormFieldsExtrasClassNames }>
					{ this.createField( 'expiration-date', Input, {
						inputMode: 'numeric',
						label: translate( 'MM/YY', {
							context: 'Expiry label on credit card form',
						} ),
					} ) }

					{ this.createField( 'cvv', Input, {
						inputMode: 'numeric',
						label: translate( 'CVV', {
							context: '3 digit security number on credit card form',
						} ),
					} ) }

					{ this.createField( 'country', CountrySelect, {
						label: translate( 'Country' ),
						countriesList: countriesList,
					} ) }

					{ ebanxDetailsRequired && this.renderEbanksFields() }

					{ this.createField( 'postal-code', Input, {
						label: translate( 'Postal Code', {
							context: 'Postal code on credit card form',
						} ),
					} ) }
				</div>
			</div>
		);
	}
}

export default localize( CreditCardFormFields );
