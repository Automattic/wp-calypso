/**
 * External dependencies
 */
var React = require( 'react' );
import { noop, find } from 'lodash';

/**
 * Internal dependencies
 */
var FormLabel = require( 'components/forms/form-label' ),
	FormTelInput = require( 'components/forms/form-tel-input' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	CountrySelect = require( 'components/forms/form-country-select' ),
	classnames = require( 'classnames' ),
	phoneValidation = require( 'lib/phone-validation' );

var CLEAN_REGEX = /^0|[\s.\-()]+/g;

module.exports = React.createClass( {
	displayName: 'FormPhoneInput',

	propTypes: {
		initialCountryCode: React.PropTypes.string,
		initialPhoneNumber: React.PropTypes.string,
		countriesList: React.PropTypes.object.isRequired,
		isDisabled: React.PropTypes.bool,
		countrySelectProps: React.PropTypes.object,
		phoneInputProps: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			isDisabled: false,
			countrySelectProps: {},
			phoneInputProps: {},
			onChange: noop
		};
	},

	getInitialState: function() {
		return {
			countryCode: this.props.initialCountryCode || '',
			phoneNumber: this.props.initialPhoneNumber || ''
		};
	},

	componentWillMount: function() {
		this._maybeSetCountryStateFromList();
	},

	componentDidUpdate: function() {
		this._maybeSetCountryStateFromList();
	},

	render: function() {
		var countryValueLink = {
				value: this.state.countryCode,
				requestChange: this._handleCountryChange
			},
			phoneValueLink = {
				value: this.state.phoneNumber,
				requestChange: this._handlePhoneChange
			};

		return (
			<div className={ classnames( this.props.className, 'form-phone-input' ) }>
				<FormFieldset className="form-fieldset__country">
					<FormLabel htmlFor="country_code">{ this.translate( 'Country Code', { context: 'The country code for the phone for the user.' } ) }</FormLabel>
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
					<FormLabel htmlFor="phone_number">{ this.translate( 'Phone Number' ) }</FormLabel>
					<FormTelInput
						{ ...this.props.phoneInputProps }
						disabled={ this.props.isDisabled }
						name="phone_number"
						valueLink={ phoneValueLink }
					/>
				</FormFieldset>
			</div>
		);
	},

	_getCountryData: function() {
		// TODO: move this to country-list or CountrySelect
		return find( this.props.countriesList.get(), {
			code: this.state.countryCode
		} );
	},

	_handleCountryChange: function( newValue ) {
		this.setState( { countryCode: newValue }, this._triggerOnChange );
	},

	_handlePhoneChange: function( newValue ) {
		this.setState( { phoneNumber: newValue }, this._triggerOnChange );
	},

	_triggerOnChange: function() {
		this.props.onChange( this.getValue() );
	},

	_cleanNumber: function( number ) {
		return number.replace( CLEAN_REGEX, '' );
	},

	// Set the default state of the country code selector, if not already set
	_maybeSetCountryStateFromList: function() {
		var countries;

		if ( this.state.countryCode ) {
			return;
		}

		countries = this.props.countriesList.get();
		if ( ! countries.length ) {
			return;
		}

		this.setState( {
			countryCode: countries[ 0 ].code
		} );
	},

	_validate: function( number ) {
		return phoneValidation( number );
	},

	getValue: function() {
		var countryData = this._getCountryData(),
			numberClean = this._cleanNumber( this.state.phoneNumber ),
			countryNumericCode = countryData ? countryData.numeric_code : '',
			numberFull = countryNumericCode + numberClean,
			isValid = this._validate( numberFull );

		return {
			isValid: ! isValid.error,
			validation: isValid,
			countryData: countryData,
			phoneNumber: numberClean,
			phoneNumberFull: numberFull
		};
	}
} );
