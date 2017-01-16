/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var FormFieldset = require( 'components/forms/form-fieldset' ),
	FormPhoneInput = require( 'components/forms/form-phone-input' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	countriesList = require( 'lib/countries-list' ).forSms(),
	Buttons = require( './buttons' );

module.exports = React.createClass( {
	displayName: 'SecurityAccountRecoveryRecoveryPhoneEdit',

	propTypes: {
		storedPhone: React.PropTypes.shape( {
			countryCode: React.PropTypes.string,
			countryNumericCode: React.PropTypes.string,
			number: React.PropTypes.string,
			numberFull: React.PropTypes.string
		} ),
		onSave: React.PropTypes.func,
		onCancel: React.PropTypes.func,
		onDelete: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			isInvalid: false
		};
	},

	render: function() {
		var validation = null,
			havePhone = ! isEmpty( this.props.storedPhone );
		if ( this.state.validation ) {
			validation = (
				<FormInputValidation
					isError
					text={ this.state.validation }
					/>
			);
		}

		return (
			<div>
				<FormFieldset>
					<FormPhoneInput
						countriesList={ countriesList }
						initialCountryCode={ havePhone ? this.props.storedPhone.countryCode : null }
						initialPhoneNumber={ havePhone ? this.props.storedPhone.number : null }
						phoneInputProps={ {
							onKeyUp: this.onKeyUp
						} }
						onChange={ this.onChange }
						/>
					{ validation }
				</FormFieldset>

				<Buttons
					isSavable={ this.isSavable() }
					isDeletable={ havePhone }
					saveText={ this.translate( 'Save Number' ) }
					onSave={ this.onSave }
					onDelete={ this.onDelete }
					onCancel={ this.onCancel }
					/>
			</div>
		);
	},

	isSavable: function() {
		if ( ! this.state.phoneNumber ) {
			return false;
		}

		if ( ! this.state.phoneNumber.phoneNumberFull ) {
			return false;
		}

		if ( this.props.storedPhone &&
				this.props.storedPhone.countryCode === this.state.phoneNumber.countryData.code &&
				this.props.storedPhone.number === this.state.phoneNumber.phoneNumber ) {
			return false;
		}

		return true;
	},

	onChange: function( phoneNumber ) {
		this.setState( { phoneNumber } );
	},

	onKeyUp: function( event ) {
		if ( event.key === 'Enter' ) {
			this.onSave();
		}
	},

	onSave: function() {
		var phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( { validation: this.translate( 'Please enter a valid phone number.' ) } );
			return;
		}

		this.setState( { isInvalid: null } );
		this.props.onSave( {
			countryCode: phoneNumber.countryData.code,
			countryNumericCode: phoneNumber.countryData.numericCode,
			number: phoneNumber.phoneNumber,
			numberFull: phoneNumber.phoneNumberFull
		} );
	},

	onCancel: function() {
		this.props.onCancel();
	},

	onDelete: function() {
		this.props.onDelete();
	}
} );
