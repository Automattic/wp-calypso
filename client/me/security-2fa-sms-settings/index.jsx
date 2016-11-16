/**
 * External dependencies
 */
var React = require( 'react' ),
	LinkedStateMixin = require( 'react-addons-linked-state-mixin' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-sms-settings' ),
	observe = require( 'lib/mixins/data-observe' );

/**
 * Internal dependencies
 */
var countriesList = require( 'lib/countries-list' ).forSms(),
	FormPhoneInput = require( 'components/forms/form-phone-input' ),
	formBase = require( 'me/form-base' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	Security2faProgress = require( 'me/security-2fa-progress' ),
	analytics = require( 'lib/analytics' );

import { protectForm } from 'lib/protect-form';
import Notice from 'components/notice';

module.exports = protectForm( React.createClass( {

	displayName: 'Security2faSMSSettings',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
		this.props.userSettings.getSettings();
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	mixins: [ formBase, LinkedStateMixin, observe( 'userSettings' ) ],

	propTypes: {
		onCancel: React.PropTypes.func.isRequired,
		onVerifyByApp: React.PropTypes.func.isRequired,
		onVerifyBySMS: React.PropTypes.func.isRequired,
		markChanged: React.PropTypes.func.isRequired,
		markSaved: React.PropTypes.func.isRequired
	},

	verifyByApp: null,

	getInitialState: function() {
		let phoneNumber = null;
		let storedCountry = this.props.userSettings.getSetting( 'two_step_sms_country' );
		let storedNumber = this.props.userSettings.getSetting( 'two_step_sms_phone_number' );
		if ( storedCountry && storedNumber ) {
			phoneNumber = {
				countryCode: storedCountry,
				phoneNumber: storedNumber,
				isValid: true
			}
		}

		return {
			lastError: false,
			phoneNumber
		};
	},

	getSubmitDisabled: function() {
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

	onVerifyByApp: function( event ) {
		event.preventDefault();
		this.verifyByApp = true;
		this.submitSMSSettings();
	},

	onVerifyBySMS: function( event ) {
		event.preventDefault();
		this.verifyByApp = false;
		this.submitSMSSettings();
	},

	/**
	 * Note:  We purposely do not use form-base's submitForm so that we can
	 * manage Notices ourselves
	 */
	submitSMSSettings: function() {
		var phoneNumber;

		if ( ! this.refs.phoneInput ) {
			return;
		}

		phoneNumber = this.state.phoneNumber;

		if ( ! phoneNumber.isValid ) {
			this.setState( { lastError: phoneNumber.validation } );
			return;
		}

		this.props.userSettings.updateSetting( 'two_step_sms_phone_number', phoneNumber.phoneNumber );
		this.props.userSettings.updateSetting( 'two_step_sms_country', phoneNumber.countryCode );

		this.setState( { submittingForm: true } );
		this.props.userSettings.saveSettings( this.onSubmitResponse );
	},

	onChangePhoneInput: function( phoneNumber ) {
		this.setState( {
			phoneNumber: {
				phoneNumber: phoneNumber.phoneNumber,
				countryCode: phoneNumber.countryData.code,
				isValid: phoneNumber.isValid,
				validation: phoneNumber.validation
			}
		} );
	},

	onSubmitResponse: function( error ) {
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

	clearLastError: function() {
		this.setState( { lastError: false } );
	},

	possiblyRenderError: function() {
		var errorMessage;

		if ( ! this.state.lastError ) {
			return null;
		}

		if ( ! this.state.lastError.message ) {
			errorMessage = this.translate( 'An unknown error occurred. Please try again later.' );
		} else {
			errorMessage = this.state.lastError.message;
		}

		return (
			<Notice
				status="is-error"
				onDismissClick={ this.clearLastError }
				text={ errorMessage }
			/>
		);
	},

	render: function() {
		var savingLabel = this.translate( 'Saving…' );

		return (
			<div className="security-2fa-sms-settings__container">
				<form className="security-2fa-sms-settings">

					<Security2faProgress step={ 1 } />
					<p>
						{ this.translate( 'First, we need your Mobile Phone number to ' +
							'send you verification codes when you choose the SMS method or ' +
							'in cases where the Authenticator App on your phone is ' +
							'unavailable.' ) }
					</p>
					<div className="security-2fa-sms-settings__fieldset-container">
						<FormPhoneInput
							ref="phoneInput"
							countriesList={ countriesList }
							disabled={ this.state.submittingForm }
							countrySelectProps={ {
								onFocus: function() {
									analytics.ga.recordEvent( 'Me', 'Focused On 2fa SMS Country Select' );
								}
							} }
							phoneInputProps= { {
								onFocus: function() {
									analytics.ga.recordEvent( 'Me', 'Focused On 2fa SMS Phone Number' );
								}
							} }
							initialCountryCode={ this.props.userSettings.getSetting( 'two_step_sms_country' ) }
							initialPhoneNumber={ this.props.userSettings.getSetting( 'two_step_sms_phone_number' ) }
							onChange={ this.onChangePhoneInput }
						/>
						{ this.possiblyRenderError() }
					</div>
					<FormButtonsBar className="security-2fa-sms-settings__buttons">
						<FormButton
							disabled={ this.getSubmitDisabled() }
							onClick={ function( event ) {
								analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Use App Button' );
								this.onVerifyByApp( event );
							}.bind( this ) }
						>
							{ this.state.submittingForm ? savingLabel : this.translate( 'Verify via App' ) }
						</FormButton>
						<FormButton
							disabled={ this.getSubmitDisabled() }
							isPrimary= { false }
							onClick={ function( event ) {
								analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Use SMS Button' );
								this.onVerifyBySMS( event );
							}.bind( this ) }
						>
							{ this.state.submittingForm ? savingLabel : this.translate( 'Verify via SMS' ) }
						</FormButton>
						<FormButton
							className="security-2fa-sms-settings__cancel-button"
							isPrimary={ false }
							onClick={ function( event ) {
								analytics.ga.recordEvent( 'Me', 'Clicked On Step 1 2fa Cancel Button' );
								this.props.onCancel( event );
							}.bind( this ) }
						>
							{ this.state.submittingForm ? savingLabel : this.translate( 'Cancel' ) }
						</FormButton>
					</FormButtonsBar>
				</form>
			</div>
		);
	}
} ) );
