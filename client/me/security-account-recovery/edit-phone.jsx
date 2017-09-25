/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormPhoneInput from 'components/forms/form-phone-input';
import FormInputValidation from 'components/forms/form-input-validation';
import Buttons from './buttons';

/**
 * Internal dependencies
 */
const countriesList = require( 'lib/countries-list' ).forSms();

export default localize( React.createClass( {
	displayName: 'SecurityAccountRecoveryRecoveryPhoneEdit',

	propTypes: {
		storedPhone: PropTypes.shape( {
			countryCode: PropTypes.string,
			countryNumericCode: PropTypes.string,
			number: PropTypes.string,
			numberFull: PropTypes.string
		} ),
		onSave: PropTypes.func,
		onCancel: PropTypes.func,
		onDelete: PropTypes.func
	},

	getInitialState: function() {
		return {
			isInvalid: false
		};
	},

	render: function() {
		let validation = null,
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
					saveText={ this.props.translate( 'Save Number' ) }
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
		const phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( { validation: this.props.translate( 'Please enter a valid phone number.' ) } );
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
} ) );
