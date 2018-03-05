/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { find, isEmpty, noop } from 'lodash';

/**
 * Internal dependencies
 */
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
import PaymentCountrySelect from 'components/payment-country-select';
import { StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { maskField, unmaskField, getCreditCardType } from 'lib/credit-card-details';
import { isEbanxEnabledForCountry } from 'lib/credit-card-details/ebanx';

export class CreditCardFormFields extends React.Component {
	static propTypes = {
		card: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		eventFormName: PropTypes.string,
		onFieldChange: PropTypes.func,
		getErrorMessage: PropTypes.func,
	};

	static defaultProps = {
		eventFormName: 'Credit card input',
		onFieldChange: noop,
		getErrorMessage: noop,
	};

	constructor( props ) {
		super( props );
		this.state = {
			userSelectedPhoneCountryCode: '',
		};
	}

	createField = ( fieldName, componentClass, props ) => {
		const errorMessage = this.props.getErrorMessage( fieldName ) || [];
		return React.createElement(
			componentClass,
			Object.assign(
				{},
				{
					additionalClasses: 'credit-card-form-fields__field',
					eventFormName: this.props.eventFormName,
					isError: ! isEmpty( errorMessage ),
					errorMessage: errorMessage[ 0 ],
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

	getFieldValue = fieldName => this.props.card[ fieldName ] || '';

	updateFieldValues = ( fieldName, nextValue ) => {
		const previousValue = this.getFieldValue( fieldName );

		if ( previousValue === nextValue ) {
			return;
		}

		const { onFieldChange } = this.props;

		const rawDetails = {
			[ fieldName ]: unmaskField( fieldName, previousValue, nextValue ),
		};

		const maskedDetails = {
			[ fieldName ]: maskField( fieldName, previousValue, nextValue ),
		};

		if ( fieldName === 'number' ) {
			rawDetails.brand = getCreditCardType( rawDetails[ fieldName ] );
		}

		onFieldChange( rawDetails, maskedDetails );
	};

	handlePhoneFieldChange = ( { value, countryCode } ) => {
		this.setState(
			{
				userSelectedPhoneCountryCode: countryCode,
			},
			() => {
				this.updateFieldValues( 'phone-number', value );
			}
		);
	};

	handleFieldChange = event => {
		this.updateFieldValues( event.target.name, event.target.value );
	};

	shouldRenderEbanx() {
		return isEbanxEnabledForCountry( this.getFieldValue( 'country' ) );
	}

	renderEbanxFields() {
		const { translate, countriesList } = this.props;
		const { userSelectedPhoneCountryCode } = this.state;
		const countryCode = this.getFieldValue( 'country' );
		const countryData = find( countriesList.get(), { code: countryCode } );
		const countryName = countryData && countryData.name ? countryData.name : '';
		let ebanxMessage = '';
		if ( countryName ) {
			ebanxMessage = translate(
				'The following fields are also required for payments in %(countryName)s',
				{
					args: {
						countryName,
					},
				}
			);
		}

		return [
			<span key="ebanx-required-fields" className="credit-card-form-fields__info-text">
				{ ebanxMessage }
			</span>,

			this.createField( 'document', Input, {
				label: translate( 'Taxpayer Identification Number', {
					comment:
						'Individual taxpayer registry identification required ' +
						'for Brazilian payment methods on credit card form',
				} ),
				key: 'document',
			} ),

			this.createField( 'phone-number', FormPhoneMediaInput, {
				onChange: this.handlePhoneFieldChange,
				countriesList: countriesList,
				// If the user has manually selected a country for the phone
				// number, use that, but otherwise default this to the same
				// country as the billing address.
				countryCode: userSelectedPhoneCountryCode || countryCode,
				label: translate( 'Phone' ),
				key: 'phone-number',
			} ),

			this.createField( 'address-1', Input, {
				maxLength: 40,
				labelClass: 'credit-card-form-fields__label',
				label: translate( 'Address' ),
				key: 'address-1',
			} ),

			this.createField( 'street-number', Input, {
				inputMode: 'numeric',
				label: translate( 'Street Number', {
					comment: 'Street number associated with address on credit card form',
				} ),
				key: 'street-number',
			} ),

			this.createField( 'address-2', HiddenInput, {
				maxLength: 40,
				labelClass: 'credit-card-form-fields__label',
				label: translate( 'Address Line 2' ),
				text: translate( '+ Add Address Line 2' ),
				key: 'address-2',
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
		const { translate, countriesList } = this.props;
		const ebanxDetailsRequired = this.shouldRenderEbanx();
		const creditCardFormFieldsExtrasClassNames = classNames( {
			'credit-card-form-fields__extras': true,
			'ebanx-details-required': ebanxDetailsRequired,
		} );

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

					{ this.createField( 'country', PaymentCountrySelect, {
						label: translate( 'Country' ),
						countriesList: countriesList,
						onChange: noop,
						onCountrySelected: this.updateFieldValues,
					} ) }

					{ ebanxDetailsRequired && this.renderEbanxFields() }

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
