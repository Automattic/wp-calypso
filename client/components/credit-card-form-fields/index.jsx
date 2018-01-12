/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { isEmpty, noop } from 'lodash';

/**
 * Internal dependencies
 */
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { maskField, unmaskField } from 'lib/credit-card-details';
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
			countryCode: '',
			phoneCountryCode: '',
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

	getFieldValue = fieldName => {
		return this.props.card[ fieldName ] || '';
	};

	updateFieldValues( fieldName, nextValue ) {
		const { onFieldChange } = this.props;

		const previousValue = this.getFieldValue( fieldName );

		const rawDetails = {
			[ fieldName ]: unmaskField( fieldName, previousValue, nextValue ),
		};

		const maskedDetails = {
			[ fieldName ]: maskField( fieldName, previousValue, nextValue ),
		};

		onFieldChange( rawDetails, maskedDetails );
	}

	handlePhoneFieldChange = ( { value, countryCode } ) => {
		this.setState(
			{
				phoneCountryCode: countryCode,
			},
			() => {
				this.updateFieldValues( 'phone-number', value );
			}
		);
	};

	handleFieldChange = event => {
		const { name: fieldName, value: nextValue, options, selectedIndex } = event.target;

		const newState = {};

		if ( fieldName === 'country' ) {
			newState.countryCode = nextValue;
			newState.countryName = options[ selectedIndex ].text;
			if ( ! this.state.phoneCountryCode ) {
				newState.phoneCountryCode = nextValue;
			}
		}

		this.setState( newState, () => this.updateFieldValues( fieldName, nextValue ) );
	};

	shouldRenderEbanx() {
		return isEbanxEnabledForCountry( this.state.countryCode );
	}

	renderEbanxFields() {
		const { translate, countriesList } = this.props;
		const { countryCode, phoneCountryCode, countryName } = this.state;

		return [
			<span key="ebanx-required-fields" className="credit-card-form-fields__info-text">
				{ translate( 'The following fields are also required for payments in %(countryName)s', {
					args: {
						countryName,
					},
				} ) }
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
				countryCode: phoneCountryCode,
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

					{ this.createField( 'country', CountrySelect, {
						label: translate( 'Country' ),
						countriesList: countriesList,
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
