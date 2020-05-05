/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';
import createReactClass from 'create-react-class';
import debugFactory from 'debug';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import FormPhoneInput from 'components/forms/form-phone-input';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import Notice from 'components/notice';
import formBase from 'me/form-base';
import Security2faProgress from 'me/security-2fa-progress';
import { gaRecordEvent } from 'lib/analytics/ga';
import observe from 'lib/mixins/data-observe';
import { protectForm } from 'lib/protect-form';
import getCountries from 'state/selectors/get-countries';
import QuerySmsCountries from 'components/data/query-countries/sms';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:me:security:2fa-sms-settings' );

const Security2faSMSSettings = createReactClass( {
	displayName: 'Security2faSMSSettings',

	componentDidMount: function () {
		debug( this.constructor.displayName + ' React component is mounted.' );
		this.props.userSettings.getSettings();
	},

	componentWillUnmount: function () {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	mixins: [ formBase, observe( 'userSettings' ) ],

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
		const storedCountry = this.props.userSettings.getSetting( 'two_step_sms_country' );
		const storedNumber = this.props.userSettings.getSetting( 'two_step_sms_phone_number' );
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
		if ( this.getDisabledState() ) {
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

	/**
	 * Note:  We purposely do not use form-base's submitForm so that we can
	 * manage Notices ourselves
	 */
	submitSMSSettings: function () {
		if ( ! this.refs.phoneInput ) {
			return;
		}

		const phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( { lastError: phoneNumber.validation } );
			return;
		}

		this.props.userSettings.updateSetting( 'two_step_sms_phone_number', phoneNumber.phoneNumber );
		this.props.userSettings.updateSetting( 'two_step_sms_country', phoneNumber.countryCode );

		this.setState( { submittingForm: true } );
		this.props.userSettings.saveSettings( this.onSubmitResponse );
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
		this.setState( { submittingForm: false } );

		if ( error ) {
			this.setState( { lastError: error } );
			return;
		}

		if ( this.verifyByApp ) {
			this.props.onVerifyByApp();
		} else {
			this.props.onVerifyBySMS();
		}
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
							ref="phoneInput"
							countriesList={ this.props.countriesList }
							disabled={ this.state.submittingForm }
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
							initialCountryCode={ this.props.userSettings.getSetting( 'two_step_sms_country' ) }
							initialPhoneNumber={ this.props.userSettings.getSetting(
								'two_step_sms_phone_number'
							) }
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
							{ this.state.submittingForm ? savingLabel : this.props.translate( 'Verify via App' ) }
						</FormButton>

						<FormButton
							disabled={ this.getSubmitDisabled() }
							isPrimary={ false }
							onClick={ function ( event ) {
								gaRecordEvent( 'Me', 'Clicked On 2fa Use SMS Button' );
								this.onVerifyBySMS( event );
							}.bind( this ) }
						>
							{ this.state.submittingForm ? savingLabel : this.props.translate( 'Verify via SMS' ) }
						</FormButton>

						<FormButton
							className="security-2fa-sms-settings__cancel-button"
							isPrimary={ false }
							onClick={ function ( event ) {
								gaRecordEvent( 'Me', 'Clicked On Step 1 2fa Cancel Button' );
								this.props.onCancel( event );
							}.bind( this ) }
						>
							{ this.state.submittingForm ? savingLabel : this.props.translate( 'Cancel' ) }
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
	connect( ( state ) => ( {
		countriesList: getCountries( state, 'sms' ),
	} ) )
)( Security2faSMSSettings );
