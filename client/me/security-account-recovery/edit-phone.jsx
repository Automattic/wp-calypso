/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormPhoneInput from 'components/forms/form-phone-input';
import FormInputValidation from 'components/forms/form-input-validation';
import Buttons from './buttons';
import getCountries from 'state/selectors/get-countries';
import QuerySmsCountries from 'components/data/query-countries/sms';

class SecurityAccountRecoveryRecoveryPhoneEdit extends React.Component {
	static displayName = 'SecurityAccountRecoveryRecoveryPhoneEdit';

	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		storedPhone: PropTypes.shape( {
			countryCode: PropTypes.string,
			countryNumericCode: PropTypes.string,
			number: PropTypes.string,
			numberFull: PropTypes.string,
		} ),
		onSave: PropTypes.func,
		onCancel: PropTypes.func,
		onDelete: PropTypes.func,
	};

	state = {
		isInvalid: false,
	};

	render() {
		const havePhone = ! isEmpty( this.props.storedPhone );

		return (
			<div>
				<FormFieldset>
					<QuerySmsCountries />
					<FormPhoneInput
						countriesList={ this.props.countriesList }
						initialCountryCode={ havePhone ? this.props.storedPhone.countryCode : null }
						initialPhoneNumber={ havePhone ? this.props.storedPhone.number : null }
						phoneInputProps={ {
							onKeyUp: this.onKeyUp,
						} }
						onChange={ this.onChange }
					/>

					{ this.state.validation && (
						<FormInputValidation isError text={ this.state.validation } />
					) }
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
	}

	isSavable = () => {
		if ( ! this.state.phoneNumber ) {
			return false;
		}

		if ( ! this.state.phoneNumber.phoneNumberFull ) {
			return false;
		}

		if (
			this.props.storedPhone &&
			this.props.storedPhone.countryCode === this.state.phoneNumber.countryData.code &&
			this.props.storedPhone.number === this.state.phoneNumber.phoneNumber
		) {
			return false;
		}

		return true;
	};

	onChange = ( phoneNumber ) => {
		this.setState( { phoneNumber } );
	};

	onKeyUp = ( event ) => {
		if ( event.key === 'Enter' ) {
			this.onSave();
		}
	};

	onSave = () => {
		const phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( {
				validation: this.props.translate( 'Please enter a valid phone number.' ),
			} );

			return;
		}

		this.setState( { isInvalid: null } );

		this.props.onSave( {
			countryCode: phoneNumber.countryData.code,
			countryNumericCode: phoneNumber.countryData.numericCode,
			number: phoneNumber.phoneNumber,
			numberFull: phoneNumber.phoneNumberFull,
		} );
	};

	onCancel = () => {
		this.props.onCancel();
	};

	onDelete = () => {
		this.props.onDelete();
	};
}

export default connect( ( state ) => ( {
	countriesList: getCountries( state, 'sms' ),
} ) )( localize( SecurityAccountRecoveryRecoveryPhoneEdit ) );
