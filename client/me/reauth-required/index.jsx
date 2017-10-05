/**
 * External dependencies
 */
import React from 'react';

import createReactClass from 'create-react-class';

import { localize } from 'i18n-calypso';

import LinkedStateMixin from 'react-addons-linked-state-mixin';
import debugFactory from 'debug';
const debug = debugFactory('calypso:me:reauth-required');

/**
 * Internal Dependencies
 */
import Dialog from 'components/dialog';

import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTelInput from 'components/forms/form-tel-input';
import FormCheckbox from 'components/forms/form-checkbox';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormInputValidation from 'components/forms/form-input-validation';
import observe from 'lib/mixins/data-observe';
import eventRecorder from 'me/event-recorder';
import userUtilities from 'lib/user/utils';
import constants from 'me/constants';

import Notice from 'components/notice';

module.exports = localize(createReactClass({

	displayName: 'ReauthRequired',

	mixins: [ LinkedStateMixin, observe( 'twoStepAuthorization' ), eventRecorder ],

	getInitialState: function() {
		return {
			remember2fa: false,      // Should the 2fa be remembered for 30 days?
			code: '',                // User's generated 2fa code
			smsRequestsAllowed: true // Can the user request another SMS code?
		};
	},

	getCodeMessage: function() {
		var codeMessage = '';

		if ( this.props.twoStepAuthorization.isTwoStepSMSEnabled() ) {
			codeMessage = this.props.translate(
				'Please check your text messages at the phone number ending with {{strong}}%(smsLastFour)s{{/strong}} ' +
				'and enter the verification code below.', {
					args: {
						smsLastFour: this.props.twoStepAuthorization.getSMSLastFour()
					},
					components: {
						strong: <strong />
					}
				}
			);
		} else {
			codeMessage = this.props.translate(
				'Please enter the verification code generated by your authenticator app.'
			);
		}

		return codeMessage;
	},

	submitForm: function( event ) {
		event.preventDefault();
		this.setState( { validatingCode: true } );

		this.props.twoStepAuthorization.validateCode(
			{
				code: this.state.code,
				remember2fa: this.state.remember2fa
			},
			function( error, data ) {
				this.setState( { validatingCode: false } );
				if ( error ) {
					debug( 'There was an error validating that code: ' + JSON.stringify( error ) );
				} else {
					debug( 'The code validated!' + JSON.stringify( data ) );
				}
			}.bind( this )
		);
	},

	codeRequestTimer: false,

	allowSMSRequests: function() {
		this.setState( { smsRequestsAllowed: true } );
	},

	sendSMSCode: function() {
		this.setState( { smsRequestsAllowed: false } );
		this.codeRequestTimer = setTimeout( this.allowSMSRequests, 60000 );

		this.props.twoStepAuthorization.sendSMSCode( function( error, data ) {
			if ( ! error && data.sent ) {
				debug( 'SMS code successfully sent' );
			} else {
				debug( 'There was a failure sending the SMS code.' );
			}
		} );
	},

	preValidateAuthCode: function() {
		return this.state.code.length && this.state.code.length > 5;
	},

	renderSendSMSButton: function() {
		var button;
		if ( this.props.twoStepAuthorization.isTwoStepSMSEnabled() ) {
			button = <FormButton
				disabled={ ! this.state.smsRequestsAllowed }
				isPrimary={ false }
				onClick={ this.recordClickEvent( 'Resend SMS Code Button on Reauth Required', this.sendSMSCode ) }
				type="button">
				{ this.props.translate( 'Resend SMS Code' ) }
			</FormButton>;
		} else {
			button = <FormButton
				disabled={ ! this.state.smsRequestsAllowed }
				isPrimary={ false }
				onClick={ this.recordClickEvent( 'Send SMS Code Button on Reauth Required', this.sendSMSCode ) }
				type="button">
				{ this.props.translate( 'Send SMS Code' ) }
			</FormButton>;
		}

		return button;
	},

	renderFailedValidationMsg: function() {
		if ( ! this.props.twoStepAuthorization.codeValidationFailed() ) {
			return null;
		}

		return <FormInputValidation isError text={ this.props.translate( 'You entered an invalid code. Please try again.' ) } />;
	},

	renderSMSResendThrottled: function() {
		if ( ! this.props.twoStepAuthorization.isSMSResendThrottled() ) {
			return null;
		}

		return (
            <div className="reauth-required__send-sms-throttled">
				<Notice
					showDismiss={ false }
					text={ this.props.translate(
						'SMS codes are limited to once per minute. Please wait and try again.'
					) } />
			</div>
        );
	},

	render: function() {
		var codePlaceholder = this.props.twoStepAuthorization.isTwoStepSMSEnabled()
			? constants.sevenDigit2faPlaceholder
			: constants.sixDigit2faPlaceholder;

		return (
            <Dialog
				autoFocus={ false }
				className="reauth-required__dialog"
				isFullScreen={ false }
				isVisible={ this.props.twoStepAuthorization.isReauthRequired() }
				buttons={ null }
				onClose={ null }
			>
				<p>{ this.getCodeMessage() }</p>

				<p>
					<a
						className="reauth-required__sign-out"
						onClick={ this.recordClickEvent( 'Reauth Required Log Out Link', userUtilities.logout ) }
					>
						{ this.props.translate( 'Not you? Sign Out' ) }
					</a>
				</p>

				<form onSubmit={ this.submitForm } >
					<FormFieldset>
						<FormLabel htmlFor="code">{ this.props.translate( 'Verification Code' ) }</FormLabel>
						<FormTelInput
							autoFocus={ true }
							id="code"
							isError={ this.props.twoStepAuthorization.codeValidationFailed() }
							name="code"
							placeholder={ codePlaceholder }
							onFocus={ this.recordFocusEvent( 'Reauth Required Verification Code Field' ) }
							valueLink={ this.linkState( 'code' ) } />

						{ this.renderFailedValidationMsg() }
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							<FormCheckbox
								checkedLink={ this.linkState( 'remember2fa' ) }
								id="remember2fa"
								name="remember2fa"
								onClick={ this.recordCheckboxEvent( 'Remember 2fa' ) } />
							<span>{ this.props.translate( 'Remember for 30 days.' ) }</span>
						</FormLabel>
					</FormFieldset>

					{ this.renderSMSResendThrottled() }

					<FormButtonsBar>
						<FormButton
							disabled={ this.state.validatingCode || ! this.preValidateAuthCode() }
							onClick={ this.recordClickEvent( 'Submit Validation Code on Reauth Required' ) }
						>
							{ this.props.translate( 'Verify' ) }
						</FormButton>

						{ this.renderSendSMSButton() }
					</FormButtonsBar>
				</form>
			</Dialog>
        );
	}
}));
