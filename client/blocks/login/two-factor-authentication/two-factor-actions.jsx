import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { isWebAuthnSupported } from 'calypso/lib/webauthn';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendSmsCode } from 'calypso/state/login/actions';
import { isTwoFactorAuthTypeSupported } from 'calypso/state/login/selectors';
import { isPartnerSignupQuery } from 'calypso/state/login/utils';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import Divider from '../divider';
import './two-factor-actions.scss';

class TwoFactorActions extends Component {
	static propTypes = {
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isSecurityKeySupported: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
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

		this.props.sendSmsCode();
	};

	recordAuthenticatorLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_authenticator_link_click' );

		this.props.switchTwoFactorAuthType( 'authenticator' );
	};
	recordSecurityKey = ( event ) => {
		event.preventDefault();
		this.props.switchTwoFactorAuthType( 'webauthn' );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isSecurityKeySupported,
			isSmsSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		const isSmsAvailable = isSmsSupported && twoFactorAuthType !== 'sms';
		const isAuthenticatorAvailable =
			isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';
		const isSecurityKeyAvailable =
			isWebAuthnSupported() && isSecurityKeySupported && twoFactorAuthType !== 'webauthn';

		if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isSecurityKeyAvailable ) {
			return null;
		}

		return (
			<Fragment>
				{ this.props.isWoo && ! this.props.isPartnerSignup && (
					<Divider>{ this.props.translate( 'or' ) }</Divider>
				) }
				<Card className="two-factor-authentication__actions wp-login__links">
					{ isSecurityKeyAvailable && (
						<Button data-e2e-link="2fa-security-key-link" onClick={ this.recordSecurityKey }>
							{ translate( 'Continue with your security\u00A0key' ) }
						</Button>
					) }

					{ isSmsAvailable && (
						<Button data-e2e-link="2fa-sms-link" onClick={ this.sendSmsCode }>
							{ translate( 'Send code via\u00A0text\u00A0message' ) }
						</Button>
					) }

					{ isAuthenticatorAvailable && (
						<Button data-e2e-link="2fa-otp-link" onClick={ this.recordAuthenticatorLinkClick }>
							{ translate( 'Continue with your authenticator\u00A0app' ) }
						</Button>
					) }
				</Card>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		isSecurityKeySupported: isTwoFactorAuthTypeSupported( state, 'webauthn' ),
		isWoo:
			isWooOAuth2Client( getCurrentOAuth2Client( state ) ) ||
			isWooCommerceCoreProfilerFlow( state ),
		isPartnerSignup: isPartnerSignupQuery( getCurrentQueryArguments( state ) ),
	} ),
	{
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( TwoFactorActions ) );
