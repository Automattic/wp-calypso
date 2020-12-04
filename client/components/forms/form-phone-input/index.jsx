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
import FormLabel from 'calypso/components/forms/form-label';
import FormTelInput from 'calypso/components/forms/form-tel-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import phoneValidation from 'calypso/lib/phone-validation';

const CLEAN_REGEX = /^0|[\s.\-()]+/g;

export class FormPhoneInput extends React.Component {
	static propTypes = {
		initialCountryCode: PropTypes.string,
		initialPhoneNumber: PropTypes.string,
		countriesList: PropTypes.array.isRequired,
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

	UNSAFE_componentWillMount() {
		this.maybeSetCountryStateFromList();
	}

	componentDidUpdate() {
		this.maybeSetCountryStateFromList();
	}

	render() {
		return (
			<div className={ classnames( this.props.className, 'form-phone-input' ) }>
				<FormFieldset className="form-fieldset__country">
					<FormLabel htmlFor="country_code">
						{ this.props.translate( 'Country code', {
							context: 'The country code for the phone for the user.',
						} ) }
					</FormLabel>
					<FormCountrySelect
						{ ...this.props.countrySelectProps }
						countriesList={ this.props.countriesList }
						disabled={ this.props.isDisabled }
						name="country_code"
						ref="countryCode"
						value={ this.state.countryCode }
						onChange={ this.handleCountryChange }
					/>
				</FormFieldset>

				<FormFieldset className="form-fieldset__phone-number">
					<FormLabel htmlFor="phone_number">{ this.props.translate( 'Phone number' ) }</FormLabel>
					<FormTelInput
						{ ...this.props.phoneInputProps }
						disabled={ this.props.isDisabled }
						name="phone_number"
						value={ this.state.phoneNumber }
						onChange={ this.handlePhoneChange }
					/>
				</FormFieldset>
			</div>
		);
	}

	getCountryData() {
		// TODO: move this to country-list or FormCountrySelect
		return find( this.props.countriesList, {
			code: this.state.countryCode,
		} );
	}

	handleCountryChange = ( event ) => {
		this.setState( { countryCode: event.target.value }, this.triggerOnChange );
	};

	handlePhoneChange = ( event ) => {
		this.setState( { phoneNumber: event.target.value }, this.triggerOnChange );
	};

	triggerOnChange = () => {
		this.props.onChange( this.getValue() );
	};

	cleanNumber( number ) {
		return number.replace( CLEAN_REGEX, '' );
	}

	// Set the default state of the country code selector, if not already set
	maybeSetCountryStateFromList() {
		if ( this.state.countryCode ) {
			return;
		}

		const { countriesList } = this.props;

		if ( ! countriesList.length ) {
			return;
		}

		this.setState( {
			countryCode: countriesList[ 0 ].code,
		} );
	}

	validate( number ) {
		return phoneValidation( number );
	}

	getValue() {
		const countryData = this.getCountryData();
		const numberClean = this.cleanNumber( this.state.phoneNumber );
		const countryNumericCode = countryData ? countryData.numeric_code : '';
		const numberFull = countryNumericCode + numberClean;
		const isValid = this.validate( numberFull );

		return {
			isValid: ! isValid.error,
			validation: isValid,
			countryData: countryData,
			phoneNumber: numberClean,
			phoneNumberFull: numberFull,
		};
	}
}

export default localize( FormPhoneInput );
