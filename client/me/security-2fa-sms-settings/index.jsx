import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import Notice from 'calypso/components/notice';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { protectForm } from 'calypso/lib/protect-form';
import getCountries from 'calypso/state/selectors/get-countries';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { setUserSetting, saveUserSettings } from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import { saveTwoStepSMSSettings } from 'calypso/state/user-settings/thunks';
import './style.scss';

class Security2faSMSSettings extends Component {
	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		onCancel: PropTypes.func.isRequired,
		onVerifyByApp: PropTypes.func.isRequired,
		onVerifyBySMS: PropTypes.func.isRequired,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		let phoneNumber = null;
		const storedCountry = this.props.userSettings.two_step_sms_country;
		const storedNumber = this.props.userSettings.two_step_sms_phone_number;

		if ( storedCountry && storedNumber ) {
			phoneNumber = {
				countryCode: storedCountry,
				phoneNumber: storedNumber,
				isValid: true,
			};
		}

		this.state = {
			lastError: false,
			phoneNumber,
		};
	}

	getSubmitDisabled() {
		if ( this.props.isUpdatingUserSettings ) {
			return true;
		}

		// empty phone number, disable the submit button
		if ( ! this.state.phoneNumber ) {
			return true;
		}

		if ( ! this.state.phoneNumber.phoneNumber.length ) {
			return true;
		}

		return false;
	}

	onVerifyByApp = ( event ) => {
		event.preventDefault();
		this.submitSMSSettings( true );
	};

	onVerifyBySMS = ( event ) => {
		event.preventDefault();
		this.submitSMSSettings();
	};

	async submitSMSSettings( verifyByApp = false ) {
		const { onVerifyByApp, onVerifyBySMS } = this.props;
		const phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( { lastError: phoneNumber.validation } );
			return;
		}

		if (
			phoneNumber.countryCode === this.props.userSettings.two_step_sms_country &&
			phoneNumber.phoneNumber === this.props.userSettings.two_step_sms_phone_number
		) {
			verifyByApp ? onVerifyByApp() : onVerifyBySMS();
			return;
		}

		try {
			await this.props.saveTwoStepSMSSettings( phoneNumber.countryCode, phoneNumber.phoneNumber );
			verifyByApp ? onVerifyByApp() : onVerifyBySMS();
		} catch ( error ) {
			this.setState( { lastError: error } );
		}
	}

	onChangePhoneInput = ( phoneNumber ) => {
		this.setState( {
			phoneNumber: {
				phoneNumber: phoneNumber.phoneNumber,
				countryCode: phoneNumber.countryData.code,
				isValid: phoneNumber.isValid,
				validation: phoneNumber.validation,
			},
		} );
	};

	clearLastError = () => {
		this.setState( { lastError: false } );
	};

	possiblyRenderError() {
		let errorMessage;

		if ( ! this.state.lastError ) {
			return null;
		}

		if ( ! this.state.lastError.message ) {
			errorMessage = this.props.translate( 'An unknown error occurred. Please try again later.' );
		} else {
			errorMessage = this.state.lastError.message;
		}

		return (
			<Notice status="is-error" onDismissClick={ this.clearLastError } text={ errorMessage } />
		);
	}

	render() {
		const savingLabel = this.props.translate( 'Saving…' );

		return (
			<div className="security-2fa-sms-settings__container">
				<form className="security-2fa-sms-settings">
					<p>
						{ this.props.translate(
							'We need your mobile phone number to send you two-step verification codes when you log in.'
						) }
					</p>

					<div className="security-2fa-sms-settings__fieldset-container">
						<QuerySmsCountries />
						<FormPhoneInput
							countriesList={ this.props.countriesList }
							disabled={ this.props.isUpdatingUserSettings }
							countrySelectProps={ {
								onFocus() {
									gaRecordEvent( 'Me', 'Focused On 2fa SMS Country Select' );
								},
							} }
							phoneInputProps={ {
								onFocus() {
									gaRecordEvent( 'Me', 'Focused On 2fa SMS Phone Number' );
								},
							} }
							initialCountryCode={ this.props.userSettings.two_step_sms_country }
							initialPhoneNumber={ this.props.userSettings.two_step_sms_phone_number }
							onChange={ this.onChangePhoneInput }
						/>

						{ this.possiblyRenderError() }
					</div>

					<FormButtonsBar className="security-2fa-sms-settings__buttons">
						<FormButton
							type="button"
							className="security-2fa-sms-settings__cancel-button"
							isPrimary={ false }
							onClick={ ( event ) => {
								gaRecordEvent( 'Me', 'Clicked On Step 1 2fa Cancel Button' );
								this.props.onCancel( event );
							} }
						>
							{ this.props.isUpdatingUserSettings ? savingLabel : this.props.translate( 'Cancel' ) }
						</FormButton>

						<FormButton
							disabled={ this.getSubmitDisabled() }
							isPrimary
							onClick={ ( event ) => {
								gaRecordEvent( 'Me', 'Clicked On 2fa Use SMS Button' );
								this.onVerifyBySMS( event );
							} }
						>
							{ this.props.isUpdatingUserSettings
								? savingLabel
								: this.props.translate( 'Continue' ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</div>
		);
	}
}

export default compose(
	protectForm,
	localize,
	connect(
		( state ) => ( {
			isUpdatingUserSettings: isUpdatingUserSettings( state ),
			userSettings: getUserSettings( state ),
			countriesList: getCountries( state, 'sms' ),
		} ),
		{
			setUserSetting,
			saveUserSettings,
			saveTwoStepSMSSettings,
		}
	)
)( Security2faSMSSettings );
