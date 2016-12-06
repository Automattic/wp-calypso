/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormSectionHeading from 'components/forms/form-section-heading';
import Security2faStatus from 'me/security-2fa-status';
import Security2faCodePrompt from 'me/security-2fa-code-prompt';
import { recordGoogleEvent } from 'state/analytics/actions';
import { successNotice } from 'state/notices/actions';

class Security2faDisable extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		userSettings: PropTypes.object.isRequired,
		translate: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		successNotice: PropTypes.func,
	}

	constructor() {
		super( ...arguments );
		this.state = {
			showingCodePrompt: false
		};
	}

	onRevealCodePrompt = () => {
		this.props.recordGoogleEvent( 'Me', 'Clicked On Disable Two-Step Authentication Button' );
		this.setState( { showingCodePrompt: true } );
	}

	onCancelCodePrompt = () => {
		this.setState( { showingCodePrompt: false } );
	}

	onCodePromptSuccess = () => {
		const { onFinished, translate } = this.props;
		this.setState( { showingCodePrompt: false } );
		this.props.successNotice( translate( 'Successfully disabled Two-Step Authentication.' ), {
			duration: 4000
		} );
		onFinished();
	}

	renderVerificationCodeMeansMessage() {
		const { userSettings, translate } = this.props;
		if ( userSettings.settings.two_step_sms_enabled ) {
			return (
				<div>
					<p>
						{ translate(
							'Your account is currently protected by Two-Step ' +
							'Authentication. While enabled, logging in to WordPress.com ' +
							'requires you to enter a unique passcode, sent via text message, ' +
							'in addition to your username and password.'
						) }
					</p>

					<p>
						{ translate(
							'Authentication codes are currently being sent to {{strong}}%(smsNumber)s{{/strong}}. ' +
							'If you wish to change this number, please disable Two-Step Authentication, ' +
							'then go through the setup wizard again.',
							{
								components: {
									strong: <strong />
								},
								args: {
									smsNumber: userSettings.getSetting( 'two_step_sms_phone_number' )
								}
							}
						) }
					</p>
				</div>
			);
		}

		return (
			<p>
				{ translate(
					'Your account is currently protected by Two-Step ' +
					'Authentication. While enabled, logging in to WordPress.com ' +
					'requires you to enter a unique passcode, generated by an app on ' +
					'your mobile device, in addition to your username and password.'
				) }
			</p>
		);
	}

	renderCodePromptToggle() {
		const { translate, userSettings } = this.props;
		if ( this.state.showingCodePrompt ) {
			return (
				<div className="security-2fa-disable__prompt">
					<FormSectionHeading>
						{ translate( 'Disable Two-Step Authentication' ) }
					</FormSectionHeading>
					<p>
						{ translate(
							'You are about to disable Two-Step Authentication. ' +
							'This means we will no longer ask for your authentication code ' +
							'when you sign into your %(userlogin)s account.',
							{
								args: {
									userlogin: userSettings.settings.user_login
								}
							}
						) }
					</p>
					<p>
						{ translate(
							'This will also disable your Application Passwords, ' +
							'though they will be available again if you choose to re-enable ' +
							'Two-Step Authentication in the future. If you do choose to ' +
							're-enable it, please note that you will need to generate ' +
							'new backup codes.'
						) }
					</p>
					<p>
						{ translate(
							'To verify that you wish to disable Two-Step ' +
							'Authentication, please enter the verification code from your ' +
							'device or a backup code and click "Disable Two-Step."'
						) }
					</p>
					<Security2faCodePrompt
						action="disable-two-step"
						onCancel={ this.onCancelCodePrompt }
						onSuccess={ this.onCodePromptSuccess }
						requestSMSOnMount={ userSettings.settings.two_step_sms_enabled }
						userSettings={ userSettings }
					/>
				</div>
			);
		}

		return (
			<FormButton isPrimary={ false } scary onClick={ this.onRevealCodePrompt }>
				{ translate( 'Disable Two-Step Authentication' ) }
			</FormButton>
		);
	}

	render() {
		return (
			<div>
				{ this.renderVerificationCodeMeansMessage() }
				<Security2faStatus twoStepEnabled={ this.props.userSettings.settings.two_step_enabled } />
				{ this.renderCodePromptToggle() }
			</div>
		);
	}
}

export default connect(
	null,
	{
		successNotice,
		recordGoogleEvent
	},
	null,
	{ pure: false }
)( localize( Security2faDisable ) );
