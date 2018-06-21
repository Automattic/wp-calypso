/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

const debug = debugFactory( 'calypso:me:security:2fa-code-prompt' );

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormVerificationCodeInput from 'components/forms/form-verification-code-input';
import Notice from 'components/notice';
import twoStepAuthorization from 'lib/two-step-authorization';

class Security2faCodePrompt extends React.Component {
	static displayName = 'Security2faCodePrompt';

	static defaultProps = {
		action: false,
		requestSMSOnMount: false,
		showCancelButton: true,
		showSMSButton: true,
	};

	static propTypes = {
		action: PropTypes.string,
		onCancel: PropTypes.func,
		onSuccess: PropTypes.func.isRequired,
		requestSMSOnMount: PropTypes.bool,
		showCancelButton: PropTypes.bool,
	};

	state = {
		codeRequestPerformed: false,
		codeRequestsAllowed: false,
		lastError: false,
		lastErrorType: false,
		submittingCode: false,
		verificationCode: '',
	};

	codeRequestTimer = false;

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );

		if ( this.props.requestSMSOnMount ) {
			this.requestCode();
		} else {
			this.allowCodeRequests();
		}
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
		this.cancelCodeRequestTimer();
	}

	cancelCodeRequestTimer = () => {
		if ( this.codeRequestTimer ) {
			clearTimeout( this.codeRequestTimer );
		}
	};

	allowCodeRequests = () => {
		this.setState( { codeRequestsAllowed: true } );
	};

	onRequestCode = event => {
		event.preventDefault();
		this.requestCode();
	};

	onCancel = event => {
		event.preventDefault();
		if ( this.props.onCancel ) {
			this.props.onCancel();
		}
	};

	requestCode = () => {
		this.setState( {
			codeRequestsAllowed: false,
			codeRequestPerformed: true,
			lastError: false,
		} );
		twoStepAuthorization.sendSMSCode( this.onCodeRequestResponse );
		this.codeRequestTimer = setTimeout( this.allowCodeRequests, 60000 );
	};

	onCodeRequestResponse = error => {
		if ( error ) {
			this.setState( {
				codeRequestPerformed: false,
				lastError: this.props.translate(
					'Unable to request a code via SMS right now. Please try again after one minute.'
				),
				lastErrorType: 'is-info',
			} );
		}
	};

	onSubmit = event => {
		event.preventDefault();
		this.setState( { submittingCode: true }, this.onBeginCodeValidation );
	};

	onBeginCodeValidation = () => {
		const args = {
			code: this.state.verificationCode,
		};

		if ( this.props.action ) {
			args.action = this.props.action;
		}

		twoStepAuthorization.validateCode( args, this.onValidationResponseReceived );
	};

	onValidationResponseReceived = ( error, data ) => {
		this.setState( { submittingCode: false } );

		if ( error ) {
			this.setState( {
				lastError: this.props.translate( 'An unexpected error occurred. Please try again later.' ),
				lastErrorType: 'is-error',
			} );
		} else if ( ! data.success ) {
			this.setState( {
				lastError: this.props.translate( 'You entered an invalid code. Please try again.' ),
				lastErrorType: 'is-error',
			} );
		} else {
			this.props.onSuccess();
		}
	};

	getSubmitButtonLabel = () => {
		switch ( this.props.action ) {
			case 'disable-two-step':
				return this.state.submittingCode
					? this.props.translate( 'Disabling Two-Step…' )
					: this.props.translate( 'Disable Two-Step' );

			case 'enable-two-step':
				return this.state.submittingCode
					? this.props.translate( 'Enabling Two-Step…' )
					: this.props.translate( 'Enable Two-Step' );

			default:
				return this.state.submittingCode
					? this.props.translate( 'Submitting…' )
					: this.props.translate( 'Submit' );
		}
	};

	clearLastError = () => {
		this.setState( { lastError: false, lastErrorType: false } );
	};

	getFormDisabled = () => {
		return this.state.submittingCode || 6 > this.state.verificationCode.trim().length;
	};

	possiblyRenderError = () => {
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
	};

	render() {
		const method = twoStepAuthorization.isTwoStepSMSEnabled() ? 'sms' : 'app';

		return (
			<form className="security-2fa-code-prompt" onSubmit={ this.onSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="verification-code">
						{ this.props.translate( 'Verification Code' ) }
					</FormLabel>

					<FormVerificationCodeInput
						autoFocus
						className="security-2fa-code-prompt__verification-code"
						disabled={ this.state.submittingForm }
						method={ method }
						name="verificationCode"
						onFocus={ function() {
							analytics.ga.recordEvent( 'Me', 'Focused On 2fa Disable Code Verification Input' );
						} }
						value={ this.state.verificationCode }
						onChange={ this.handleChange }
					/>
					{ this.state.codeRequestPerformed ? (
						<FormSettingExplanation>
							{ this.props.translate(
								'A code has been sent to your device via SMS.  ' +
									'You may request another code after one minute.'
							) }
						</FormSettingExplanation>
					) : null }
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

					{ this.props.showSMSButton ? (
						<FormButton
							className="security-2fa-code-prompt__send-code"
							disabled={ ! this.state.codeRequestsAllowed }
							isPrimary={ false }
							onClick={ function( event ) {
								analytics.ga.recordEvent(
									'Me',
									'Clicked On 2fa Code Prompt Send Code Via SMS Button'
								);
								this.onRequestCode( event );
							}.bind( this ) }
						>
							{ this.state.codeRequestPerformed
								? this.props.translate( 'Resend Code' )
								: this.props.translate( 'Send Code via SMS' ) }
						</FormButton>
					) : null }

					{ this.props.showCancelButton ? (
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
					) : null }
				</FormButtonsBar>
			</form>
		);
	}

	handleChange = e => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

export default localize( Security2faCodePrompt );
