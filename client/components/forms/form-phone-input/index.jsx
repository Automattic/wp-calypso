/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { identity, noop, find } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormTelInput from 'components/forms/form-tel-input';
import FormFieldset from 'components/forms/form-fieldset';
import CountrySelect from 'components/forms/form-country-select';
import phoneValidation from 'lib/phone-validation';

const CLEAN_REGEX = /^0|[\s.\-()]+/g;

export class FormPhoneInput extends React.Component {
	static propTypes = {
		initialCountryCode: PropTypes.string,
		initialPhoneNumber: PropTypes.string,
		countriesList: PropTypes.object.isRequired,
		isDisabled: PropTypes.bool,
		countrySelectProps: PropTypes.object,
		phoneInputProps: PropTypes.object,
		onChange: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		isDisabled: false,
		countrySelectProps: {},
		phoneInputProps: {},
		onChange: noop,
		translate: identity,
	};

	state = {
		countryCode: this.props.initialCountryCode || '',
		phoneNumber: this.props.initialPhoneNumber || '',
	};

	componentWillMount() {
		this._maybeSetCountryStateFromList();
	}

	componentDidUpdate() {
		this._maybeSetCountryStateFromList();
	}

	render() {
		let countryValueLink = {
				value: this.state.countryCode,
				requestChange: this._handleCountryChange,
			},
			phoneValueLink = {
				value: this.state.phoneNumber,
				requestChange: this._handlePhoneChange,
			};

		return (
			<div className={ classnames( this.props.className, 'form-phone-input' ) }>
				<FormFieldset className="form-fieldset__country">
					<FormLabel htmlFor="country_code">
						{ this.props.translate( 'Country Code', {
							context: 'The country code for the phone for the user.',
						} ) }
					</FormLabel>
					<CountrySelect
						{ ...this.props.countrySelectProps }
						countriesList={ this.props.countriesList }
						disabled={ this.props.isDisabled }
						name="country_code"
						ref="countryCode"
						valueLink={ countryValueLink }
					/>
				</FormFieldset>

				<FormFieldset className="form-fieldset__phone-number">
					<FormLabel htmlFor="phone_number">
						{ this.props.translate( 'Phone Number' ) }
					</FormLabel>
					<FormTelInput
						{ ...this.props.phoneInputProps }
						disabled={ this.props.isDisabled }
						name="phone_number"
						valueLink={ phoneValueLink }
					/>
				</FormFieldset>
			</div>
		);
	}

	_getCountryData = () => {
		// TODO: move this to country-list or CountrySelect
		return find( this.props.countriesList.get(), {
			code: this.state.countryCode,
		} );
	};

	_handleCountryChange = newValue => {
		this.setState( { countryCode: newValue }, this._triggerOnChange );
	};

	_handlePhoneChange = newValue => {
		this.setState( { phoneNumber: newValue }, this._triggerOnChange );
	};

	_triggerOnChange = () => {
		this.props.onChange( this.getValue() );
	};

	_cleanNumber = number => {
		return number.replace( CLEAN_REGEX, '' );
	};

	// Set the default state of the country code selector, if not already set
	_maybeSetCountryStateFromList = () => {
		let countries;

		if ( this.state.countryCode ) {
			return;
		}

		countries = this.props.countriesList.get();
		if ( ! countries.length ) {
			return;
		}

		this.setState( {
			countryCode: countries[ 0 ].code,
		} );
	};

	_validate = number => {
		return phoneValidation( number );
	};

	getValue = () => {
		let countryData = this._getCountryData(),
			numberClean = this._cleanNumber( this.state.phoneNumber ),
			countryNumericCode = countryData ? countryData.numeric_code : '',
			numberFull = countryNumericCode + numberClean,
			isValid = this._validate( numberFull );

		return {
			isValid: ! isValid.error,
			validation: isValid,
			countryData: countryData,
			phoneNumber: numberClean,
			phoneNumberFull: numberFull,
		};
	};
}

export default localize( FormPhoneInput );
