/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';
import createReactClass from 'create-react-class';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import Notice from 'calypso/components/notice';
import Security2faProgress from 'calypso/me/security-2fa-progress';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { protectForm } from 'calypso/lib/protect-form';
import getCountries from 'calypso/state/selectors/get-countries';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import {
	setUserSetting,
	saveUserSettings,
	saveTwoStepSettings,
} from 'calypso/state/user-settings/actions';
import { saveTwoStepSMSSettings } from 'calypso/state/user-settings/thunks';

/**
 * Style dependencies
 */
import './style.scss';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';

// eslint-disable-next-line react/prefer-es6-class
const Security2faSMSSettings = createReactClass( {
	displayName: 'Security2faSMSSettings',

	propTypes: {
		countriesList: PropTypes.array.isRequired,
		onCancel: PropTypes.func.isRequired,
		onVerifyByApp: PropTypes.func.isRequired,
		onVerifyBySMS: PropTypes.func.isRequired,
		markChanged: PropTypes.func.isRequired,
		markSaved: PropTypes.func.isRequired,
	},

	verifyByApp: null,

	getInitialState: function () {
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

		return {
			lastError: false,
			phoneNumber,
		};
	},

	getSubmitDisabled: function () {
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
	},

	onVerifyByApp: function ( event ) {
		event.preventDefault();
		this.verifyByApp = true;
		this.submitSMSSettings();
	},

	onVerifyBySMS: function ( event ) {
		event.preventDefault();
		this.verifyByApp = false;
		this.submitSMSSettings();
	},

	submitSMSSettings: async function () {
		const phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( { lastError: phoneNumber.validation } );
			return;
		}

		try {
			await this.props.saveTwoStepSMSSettings( phoneNumber.countryCode, phoneNumber.phoneNumber );
			this.onSubmitResponse();
		} catch ( error ) {
			this.onSubmitResponse( error );
		}
	},

	onChangePhoneInput: function ( phoneNumber ) {
		this.setState( {
			phoneNumber: {
				phoneNumber: phoneNumber.phoneNumber,
				countryCode: phoneNumber.countryData.code,
				isValid: phoneNumber.isValid,
				validation: phoneNumber.validation,
			},
		} );
	},

	onSubmitResponse: function ( error ) {
		if ( error ) {
			this.setState( { lastError: error } );
			return;
		}

		const { onVerifyByApp, onVerifyBySMS } = this.props;

		this.verifyByApp ? onVerifyByApp() : onVerifyBySMS();
	},

	clearLastError: function () {
		this.setState( { lastError: false } );
	},

	possiblyRenderError: function () {
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
	},

	render: function () {
		const savingLabel = this.props.translate( 'Saving…' );

		return (
			<div className="security-2fa-sms-settings__container">
				<form className="security-2fa-sms-settings">
					<Security2faProgress step={ 1 } />

					<p>
						{ this.props.translate(
							'First, we need your Mobile Phone number to ' +
								'send you verification codes when you choose the SMS method or ' +
								'in cases where the authenticator app on your phone is ' +
								'unavailable.'
						) }
					</p>

					<div className="security-2fa-sms-settings__fieldset-container">
						<QuerySmsCountries />
						<FormPhoneInput
							countriesList={ this.props.countriesList }
							disabled={ this.props.isUpdatingUserSettings }
							countrySelectProps={ {
								onFocus: function () {
									gaRecordEvent( 'Me', 'Focused On 2fa SMS Country Select' );
								},
							} }
							phoneInputProps={ {
								onFocus: function () {
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
							disabled={ this.getSubmitDisabled() }
							onClick={ function ( event ) {
								gaRecordEvent( 'Me', 'Clicked On 2fa Use App Button' );
								this.onVerifyByApp( event );
							}.bind( this ) }
						>
							{ this.props.isUpdatingUserSettings
								? savingLabel
								: this.props.translate( 'Verify via App' ) }
						</FormButton>

						<FormButton
							disabled={ this.getSubmitDisabled() }
							isPrimary={ false }
							onClick={ function ( event ) {
								gaRecordEvent( 'Me', 'Clicked On 2fa Use SMS Button' );
								this.onVerifyBySMS( event );
							}.bind( this ) }
						>
							{ this.props.isUpdatingUserSettings
								? savingLabel
								: this.props.translate( 'Verify via SMS' ) }
						</FormButton>

						<FormButton
							className="security-2fa-sms-settings__cancel-button"
							isPrimary={ false }
							onClick={ function ( event ) {
								gaRecordEvent( 'Me', 'Clicked On Step 1 2fa Cancel Button' );
								this.props.onCancel( event );
							}.bind( this ) }
						>
							{ this.props.isUpdatingUserSettings ? savingLabel : this.props.translate( 'Cancel' ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</div>
		);
	},
} );

export default flowRight(
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
			saveTwoStepSettings,
			saveTwoStepSMSSettings,
		}
	)
)( Security2faSMSSettings );
