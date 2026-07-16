import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import getGravatarOAuth2Flow from 'calypso/lib/get-gravatar-oauth2-flow';
import { isGravPoweredOAuth2Client } from 'calypso/lib/oauth2-clients';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendSmsCode } from 'calypso/state/login/actions';
import { isTwoFactorAuthTypeSupported } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

import './security-key-reregister.scss';

class SecurityKeyReregister extends Component {
	static propTypes = {
		switchTwoFactorAuthType: PropTypes.func.isRequired,
		isAuthenticatorSupported: PropTypes.bool,
		isSmsSupported: PropTypes.bool,
		isBackupCodeSupported: PropTypes.bool,
		oauth2Client: PropTypes.object,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_login_security_key_reregister_notice_show' );
	}

	switchTo = ( authType ) => ( event ) => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_security_key_reregister_switch_click', {
			auth_type: authType,
		} );
		this.props.switchTwoFactorAuthType( authType );
	};

	switchToSms = ( event ) => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_security_key_reregister_switch_click', {
			auth_type: 'sms',
		} );
		this.props.switchTwoFactorAuthType( 'sms' );

		if ( isGravPoweredOAuth2Client( this.props.oauth2Client ) ) {
			this.props.sendSmsCode( getGravatarOAuth2Flow( this.props.oauth2Client ) );
		} else {
			this.props.sendSmsCode();
		}
	};

	render() {
		const { translate, isAuthenticatorSupported, isSmsSupported, isBackupCodeSupported } =
			this.props;

		return (
			<Card className="security-key-reregister">
				<h2 className="security-key-reregister__heading">
					{ translate( 'Action needed: re-register your security key' ) }
				</h2>
				<p className="security-key-reregister__text">
					{ translate(
						'Due to a small setup issue, some security keys were linked to the wrong WordPress.com domain. This is not a security concern. Your account and data are safe.'
					) }
				</p>
				<p className="security-key-reregister__text">
					{ translate(
						'To get back in, please log in using one of your backup options, then register a new security key.'
					) }
				</p>

				<div className="security-key-reregister__actions">
					{ isAuthenticatorSupported && (
						<Button
							variant="primary"
							__next40pxDefaultSize
							onClick={ this.switchTo( 'authenticator' ) }
						>
							{ translate( 'Sign in with authenticator app' ) }
						</Button>
					) }
					{ isSmsSupported && (
						<Button variant="primary" __next40pxDefaultSize onClick={ this.switchToSms }>
							{ translate( 'Sign in with SMS code' ) }
						</Button>
					) }
					{ isBackupCodeSupported && (
						<Button variant="primary" __next40pxDefaultSize onClick={ this.switchTo( 'backup' ) }>
							{ translate( 'Sign in with backup codes' ) }
						</Button>
					) }
				</div>

				<p className="security-key-reregister__support">
					{ translate(
						'Need a hand? {{contactSupportLink}}Contact support{{/contactSupportLink}}',
						{
							components: {
								contactSupportLink: (
									<a href="https://wordpress.com/help/contact" target="_blank" rel="noreferrer" />
								),
							},
						}
					) }
				</p>
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		isBackupCodeSupported: isTwoFactorAuthTypeSupported( state, 'backup' ),
		oauth2Client: getCurrentOAuth2Client( state ),
	} ),
	{ recordTracksEvent, sendSmsCode }
)( localize( SecurityKeyReregister ) );
