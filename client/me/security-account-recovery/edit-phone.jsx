import { FormInputValidation } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import getCountries from 'calypso/state/selectors/get-countries';
import Buttons from './buttons';

class SecurityAccountRecoveryRecoveryPhoneEdit extends Component {
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

	state = {};

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
					onDelete={ this.props.onDelete }
					onCancel={ this.props.onCancel }
				/>
			</div>
		);
	}

	isSavable = () => {
		if ( ! this.state.phoneNumber ) {
			return false;
		}

		if ( ! this.state.phoneNumber.phoneNumber || ! this.state.phoneNumber.phoneNumberFull ) {
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

		this.props.onSave( {
			countryCode: phoneNumber.countryData.code,
			countryNumericCode: phoneNumber.countryData.numericCode,
			number: phoneNumber.phoneNumber,
			numberFull: phoneNumber.phoneNumberFull,
		} );
	};
}

export default connect( ( state ) => ( {
	countriesList: getCountries( state, 'sms' ),
} ) )( localize( SecurityAccountRecoveryRecoveryPhoneEdit ) );
