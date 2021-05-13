/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'calypso/components/forms/form-button';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import Security2faStatus from 'calypso/me/security-2fa-status';
import Security2faCodePrompt from 'calypso/me/security-2fa-code-prompt';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { localizeUrl } from 'calypso/lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

class Security2faDisable extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		userSettings: PropTypes.object.isRequired,
		translate: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		successNotice: PropTypes.func,
	};

	constructor() {
		super( ...arguments );
		this.state = {
			showingCodePrompt: false,
		};
	}

	onRevealCodePrompt = () => {
		this.props.recordGoogleEvent( 'Me', 'Clicked On Disable Two-Step Authentication Button' );
		this.setState( { showingCodePrompt: true } );
	};

	onCancelCodePrompt = () => {
		this.setState( { showingCodePrompt: false } );
	};

	onCodePromptSuccess = () => {
		const { onFinished, translate } = this.props;
		this.setState( { showingCodePrompt: false } );
		this.props.successNotice( translate( 'Successfully disabled Two-Step Authentication.' ), {
			duration: 4000,
		} );
		onFinished();
	};

	renderVerificationCodeMeansMessage() {
		const { userSettings, translate } = this.props;
		if ( userSettings.two_step_sms_enabled ) {
			return (
				<div>
					<p>
						{ translate(
							"You've enabled two-step authentication. " +
								'While enabled, logging in to WordPress.com ' +
								'requires you to enter a unique passcode, sent via text message, ' +
								'in addition to your username and password.'
						) }
					</p>

					<p>
						{ translate(
							"You're all set to receive authentication codes at " +
								'{{strong}}%(smsNumber)s{{/strong}}. ' +
								'Want to switch to a different number? No problem! ' +
								"You'll need to disable two-step authentication, " +
								'then complete the setup process again on another device.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									smsNumber: userSettings.two_step_sms_phone_number,
								},
							}
						) }
					</p>
				</div>
			);
		}

		return (
			<div>
				<p>
					{ translate(
						"You've enabled two-step authentication on your account — smart move! " +
							"When you log in to WordPress.com, you'll need to enter your " +
							'username and password, as well as a unique passcode generated ' +
							'by an app on your mobile device.'
					) }
				</p>
				<p>
					{ translate(
						'Switching to a new device? ' +
							'{{changephonelink}}Follow these steps{{/changephonelink}} ' +
							'to avoid losing access to your account.',
						{
							components: {
								changephonelink: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/security/two-step-authentication/#moving-to-a-new-device'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</div>
		);
	}

	renderCodePromptToggle() {
		const { translate, userSettings } = this.props;
		if ( this.state.showingCodePrompt ) {
			return (
				<div className="security-2fa-disable__prompt">
					<FormSectionHeading>
						{ translate( 'Disable two-step authentication' ) }
					</FormSectionHeading>
					<p>
						{ translate(
							'You are about to disable two-step authentication. ' +
								'This means we will no longer ask for your authentication ' +
								'code when you sign into your {{strong}}%(userlogin)s{{/strong}} account.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									userlogin: userSettings.user_login,
								},
							}
						) }
					</p>
					<p>
						{ translate(
							'This will also disable your application passwords, ' +
								'though you can access them again if you ever re-enable ' +
								'two-step authentication. If you decide to re-enable ' +
								"two-step authentication, keep in mind you'll need to " +
								'generate new backup codes.'
						) }
					</p>
					<p>
						{ translate(
							'To verify that you wish to disable two-step authentication, ' +
								'enter the verification code from your device or a backup code, ' +
								'and click "Disable two-step."'
						) }
					</p>
					<Security2faCodePrompt
						action="disable-two-step"
						onCancel={ this.onCancelCodePrompt }
						onSuccess={ this.onCodePromptSuccess }
						requestSMSOnMount={ userSettings.two_step_sms_enabled }
					/>
				</div>
			);
		}

		return (
			<FormButton isPrimary={ false } scary onClick={ this.onRevealCodePrompt }>
				{ translate( 'Disable two-step authentication' ) }
			</FormButton>
		);
	}

	render() {
		return (
			<div>
				{ this.renderVerificationCodeMeansMessage() }
				<Security2faStatus twoStepEnabled={ this.props.userSettings.two_step_enabled } />
				{ this.renderCodePromptToggle() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
	} ),
	{
		successNotice,
		recordGoogleEvent,
	},
	null,
	{ pure: false }
)( localize( Security2faDisable ) );
