/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

import LinkedStateMixin from 'react-addons-linked-state-mixin';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-code-prompt' );

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';

import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTelInput from 'components/forms/form-tel-input';
import twoStepAuthorization from 'lib/two-step-authorization';
import analytics from 'lib/analytics';
import constants from 'me/constants';
import FormButtonsBar from 'components/forms/form-buttons-bar';

import Notice from 'components/notice';

export default localize( React.createClass( {

	displayName: 'Security2faCodePrompt',

	mixins: [ LinkedStateMixin ],

	codeRequestTimer: false,

	getDefaultProps: function() {
		return {
			action: false,
			requestSMSOnMount: false,
			showCancelButton: true,
			showSMSButton: true
		};
	},

	propTypes: {
		action: React.PropTypes.string,
		onCancel: React.PropTypes.func,
		onSuccess: React.PropTypes.func.isRequired,
		requestSMSOnMount: React.PropTypes.bool,
		showCancelButton: React.PropTypes.bool
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );

		if ( this.props.requestSMSOnMount ) {
			this.requestCode();
		} else {
			this.allowCodeRequests();
		}
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
		this.cancelCodeRequestTimer();
	},

	cancelCodeRequestTimer: function() {
		if ( this.codeRequestTimer ) {
			clearTimeout( this.codeRequestTimer );
		}
	},

	getInitialState: function() {
		return {
			codeRequestPerformed: false,
			codeRequestsAllowed: false,
			lastError: false,
			lastErrorType: false,
			submittingCode: false,
			verificationCode: ''
		};
	},

	allowCodeRequests: function() {
		this.setState( { codeRequestsAllowed: true } );
	},

	onRequestCode: function( event ) {
		event.preventDefault();
		this.requestCode();
	},

	onCancel: function( event ) {
		event.preventDefault();
		if ( this.props.onCancel ) {
			this.props.onCancel();
		}
	},

	requestCode: function() {
		this.setState(
			{
				codeRequestsAllowed: false,
				codeRequestPerformed: true,
				lastError: false
			}
		);
		twoStepAuthorization.sendSMSCode( this.onCodeRequestResponse );
		this.codeRequestTimer = setTimeout( this.allowCodeRequests, 60000 );
	},

	onCodeRequestResponse: function( error ) {
		if ( error ) {
			this.setState(
				{
					codeRequestPerformed: false,
					lastError: this.props.translate( 'Unable to request a code via SMS right now. Please try again after one minute.' ),
					lastErrorType: 'is-info'
				}
			);
		}
	},

	onSubmit: function( event ) {
		event.preventDefault();
		this.setState( { submittingCode: true }, this.onBeginCodeValidation );
	},

	onBeginCodeValidation: function() {
		const args = {
			code: this.state.verificationCode
		};

		if ( this.props.action ) {
			args.action = this.props.action;
		}

		twoStepAuthorization.validateCode( args, this.onValidationResponseReceived );
	},

	onValidationResponseReceived: function( error, data ) {
		this.setState( { submittingCode: false } );

		if ( error ) {
			this.setState(
				{
					lastError: this.props.translate( 'An unexpected error occurred. Please try again later.' ),
					lastErrorType: 'is-error'
				}
			);
		} else if ( ! data.success ) {
			this.setState(
				{
					lastError: this.props.translate( 'You entered an invalid code. Please try again.' ),
					lastErrorType: 'is-error'
				}
			);
		} else {
			this.props.onSuccess();
		}
	},

	getSubmitButtonLabel: function() {
		let label;

		switch ( this.props.action ) {
			case 'disable-two-step':
				label = this.state.submittingCode ? this.props.translate( 'Disabling Two-Step…' ) : this.props.translate( 'Disable Two-Step' );
				break;
			case 'enable-two-step':
				label = this.state.submittingCode ? this.props.translate( 'Enabling Two-Step…' ) : this.props.translate( 'Enable Two-Step' );
				break;
			default:
				label = this.state.submittingCode ? this.props.translate( 'Submitting…' ) : this.props.translate( 'Submit' );
		}

		return label;
	},

	clearLastError: function() {
		this.setState( { lastError: false, lastErrorType: false } );
	},

	getFormDisabled: function() {
		return ( this.state.submittingCode || 6 > this.state.verificationCode.trim().length );
	},

	possiblyRenderError: function() {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
			<Notice
				status={ this.state.lastErrorType }
				onDismissClick={ this.clearLastError }
				text={ this.state.lastError }
			/>
		);
	},

	render: function() {
		const codePlaceholder = twoStepAuthorization.isTwoStepSMSEnabled()
			? constants.sevenDigit2faPlaceholder
			: constants.sixDigit2faPlaceholder;

		return (
		    <form className="security-2fa-code-prompt" onSubmit={ this.onSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="verification-code">{ this.props.translate( 'Verification Code' ) }</FormLabel>
					<FormTelInput
						autoFocus
						className="security-2fa-code-prompt__verification-code"
						disabled={ this.state.submittingForm }
						name="verification-code"
						placeholder={ codePlaceholder }
						autoComplete="off"
						valueLink={ this.linkState( 'verificationCode' ) }
						onFocus={ function() {
							analytics.ga.recordEvent( 'Me', 'Focused On 2fa Disable Code Verification Input' );
						} }
					/>
					{
						this.state.codeRequestPerformed
						? (
							<FormSettingExplanation>
								{
									this.props.translate(
										'A code has been sent to your device via SMS.  ' +
										'You may request another code after one minute.'
									)
								}
							</FormSettingExplanation>
						)
						: null
					}
					{ this.possiblyRenderError() }
				</FormFieldset>
				<FormButtonsBar className="security-2fa-code-prompt__buttons-bar">
					<FormButton
						className="security-2fa-code-prompt__verify-code"
						disabled={ this.getFormDisabled() }
						onClick={ function() {
							analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Code Prompt Verify Button' );
						} }
					>
						{ this.getSubmitButtonLabel() }
					</FormButton>

					{
						this.props.showSMSButton
						? (
							<FormButton
								className="security-2fa-code-prompt__send-code"
								disabled={ ! this.state.codeRequestsAllowed }
								isPrimary={ false }
								onClick={ function( event ) {
									analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Code Prompt Send Code Via SMS Button' );
									this.onRequestCode( event );
								}.bind( this ) }
							>
								{ this.state.codeRequestPerformed ? this.props.translate( 'Resend Code' ) : this.props.translate( 'Send Code via SMS' ) }
							</FormButton>
						)
						: null
					}

					{
						this.props.showCancelButton
						? (
							<FormButton
								className="security-2fa-code-prompt__cancel"
								isPrimary={ false }
								onClick={ function( event ) {
									analytics.ga.recordEvent( 'Me', 'Clicked On Disable 2fa Cancel Button' );
									this.onCancel( event );
								}.bind( this ) }
							>
								{ this.props.translate( 'Cancel' ) }
							</FormButton>
						)
						: null
					}
				</FormButtonsBar>
			</form>
		);
	}
} ) );
