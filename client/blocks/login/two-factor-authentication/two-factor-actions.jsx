import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FormDivider } from 'calypso/blocks/authentication';
import getGravatarOAuth2Flow from 'calypso/lib/get-gravatar-oauth2-flow';
import { isGravPoweredOAuth2Client } from 'calypso/lib/oauth2-clients';
import { isWebAuthnSupported } from 'calypso/lib/webauthn';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendSmsCode } from 'calypso/state/login/actions';
import { isTwoFactorAuthTypeSupported } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getIsWoo from 'calypso/state/selectors/get-is-woo';

import './two-factor-actions.scss';

class TwoFactorActions extends Component {
	static propTypes = {
		oauth2Client: PropTypes.object.isRequired,
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isSecurityKeySupported: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
		isWoo: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		switchTwoFactorAuthType: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	sendSmsCode = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_sms_link_click' );

		this.props.switchTwoFactorAuthType( 'sms' );

		if ( isGravPoweredOAuth2Client( this.props.oauth2Client ) ) {
			// Pass the OAuth2 client's flow name to customize the SMS message for Gravatar-powered OAuth2 clients.
			this.props.sendSmsCode( getGravatarOAuth2Flow( this.props.oauth2Client ) );
		} else {
			this.props.sendSmsCode();
		}
	};

	recordAuthenticatorLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_authenticator_link_click' );

		this.props.switchTwoFactorAuthType( 'authenticator' );
	};

	recordBackupLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_backup_link_click' );

		this.props.switchTwoFactorAuthType( 'backup' );
	};

	recordSecurityKey = ( event ) => {
		event.preventDefault();
		this.props.switchTwoFactorAuthType( 'webauthn' );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isBackupCodeSupported,
			isSecurityKeySupported,
			isSmsSupported,
			isWoo,
			translate,
			twoFactorAuthType,
		} = this.props;

		const isSmsAvailable = isSmsSupported && twoFactorAuthType !== 'sms';
		const isBackupCodeAvailable = isBackupCodeSupported && twoFactorAuthType !== 'backup';
		const isAuthenticatorAvailable =
			isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';
		const isSecurityKeyAvailable =
			isWebAuthnSupported() && isSecurityKeySupported && twoFactorAuthType !== 'webauthn';

		if (
			! isSmsAvailable &&
			! isAuthenticatorAvailable &&
			! isSecurityKeyAvailable &&
			! isBackupCodeAvailable
		) {
			return null;
		}

		return (
			<Fragment>
				{ isWoo && twoFactorAuthType !== 'push' && <FormDivider /> }
				<Card className="two-factor-authentication__actions">
					{ isSecurityKeyAvailable && (
						<Button
							variant="secondary"
							className="a8c-components-wp-button"
							data-e2e-link="2fa-security-key-link"
							onClick={ this.recordSecurityKey }
							__next40pxDefaultSize
						>
							{ translate( 'Continue with your security\u00A0key' ) }
						</Button>
					) }

					{ isSmsAvailable && (
						<Button
							variant="secondary"
							className="a8c-components-wp-button"
							data-e2e-link="2fa-sms-link"
							onClick={ this.sendSmsCode }
							__next40pxDefaultSize
						>
							{ translate( 'Send code via\u00A0text\u00A0message' ) }
						</Button>
					) }

					{ isAuthenticatorAvailable && (
						<Button
							variant="secondary"
							className="a8c-components-wp-button"
							data-e2e-link="2fa-otp-link"
							onClick={ this.recordAuthenticatorLinkClick }
							__next40pxDefaultSize
						>
							{ translate( 'Use authenticator\u00A0app instead' ) }
						</Button>
					) }

					{ isBackupCodeAvailable && (
						<Button
							variant="secondary"
							className="a8c-components-wp-button"
							onClick={ this.recordBackupLinkClick }
							__next40pxDefaultSize
						>
							{ translate( 'Use a backup code instead' ) }
						</Button>
					) }
				</Card>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => {
		const oauth2Client = getCurrentOAuth2Client( state );

		return {
			oauth2Client,
			isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
			isBackupCodeSupported: isTwoFactorAuthTypeSupported( state, 'backup' ),
			isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
			isSecurityKeySupported: isTwoFactorAuthTypeSupported( state, 'webauthn' ),
			isWoo: getIsWoo( state ),
		};
	},
	{
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( TwoFactorActions ) );
