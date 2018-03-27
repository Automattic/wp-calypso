/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import analytics from 'lib/analytics';

class Security2faEnableButtons extends React.Component {
	handleEnableClick = () => {
		analytics.ga.recordEvent( 'Me', 'Clicked On Enable 2fa Button', 'method', this.state.method );
	};
	handleCancelClick = () => {
		analytics.ga.recordEvent(
			'Me',
			'Clicked On Step2 Cancel 2fa Button',
			'method',
			this.state.method
		);
		this.props.onCancel( event );
	};
	handleResendClick = () => {
		analytics.ga.recordEvent( 'Me', 'Clicked On Resend SMS Button' );
		this.onResendCode( event );
	};
	handleUseSMSClick = () => {
		analytics.ga.recordEvent( 'Me', 'Clicked On Enable SMS Use SMS Button' );
		this.onVerifyBySMS( event );
	};
	render() {
		return (
			<FormButtonsBar className="security-2fa-enable__buttons-bar">
				<FormButton
					className="security-2fa-enable__verify"
					disabled={ this.getFormDisabled() }
					onclick={ this.handleEnableClick }
				>
					{ this.state.submittingCode
						? this.props.translate( 'Enabling…', {
								context: 'A button label used during Two-Step setup.',
							} )
						: this.props.translate( 'Enable', {
								context: 'A button label used during Two-Step setup.',
							} ) }
				</FormButton>

				<FormButton
					className="security-2fa-enable__cancel"
					isPrimary={ false }
					onclick={ this.handleCancelClick }
				>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>

				{ 'sms' === this.state.method ? (
					<FormButton
						disabled={ ! this.state.smsRequestsAllowed }
						isPrimary={ false }
						onclick={ this.handleResendClick }
					>
						{ this.props.translate( 'Resend Code', {
							context: 'A button label to let a user get the SMS code sent again.',
						} ) }
					</FormButton>
				) : (
					<FormButton isPrimary={ false } onclick={ this.handleUseSMSClick }>
						{ this.props.translate( 'Use SMS', {
							context: 'A button label to let a user switch to enabling Two-Step by SMS.',
						} ) }
					</FormButton>
				) }
			</FormButtonsBar>
		);
	}
}

export default Security2faEnableButtons;
