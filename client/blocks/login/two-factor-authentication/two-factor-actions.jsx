/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */

import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isTwoFactorAuthTypeSupported } from 'state/login/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { sendSmsCode } from 'state/login/actions';
import { login } from 'lib/paths';

/**
 * Style dependencies
 */
import './two-factor-actions.scss';

class TwoFactorActions extends Component {
	static propTypes = {
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isSecurityKeySupported: PropTypes.bool.isRequired,
		isJetpack: PropTypes.bool,
		isGutenboarding: PropTypes.bool,
		isSmsSupported: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	sendSmsCode = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_sms_link_click' );

		page(
			login( {
				isNative: true,
				twoFactorAuthType: 'sms',
				isJetpack: this.props.isJetpack,
				isGutenboarding: this.props.isGutenboarding,
			} )
		);

		this.props.sendSmsCode();
	};

	recordAuthenticatorLinkClick = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_authenticator_link_click' );

		page(
			login( {
				isNative: true,
				twoFactorAuthType: 'authenticator',
				isJetpack: this.props.isJetpack,
				isGutenboarding: this.props.isGutenboarding,
			} )
		);
	};
	recordSecurityKey = ( event ) => {
		event.preventDefault();
		page( login( { isNative: true, twoFactorAuthType: 'webauthn' } ) );
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
		const isSecurityKeyAvailable = isSecurityKeySupported && twoFactorAuthType !== 'webauthn';

		if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isSecurityKeyAvailable ) {
			return null;
		}

		return (
			<Card className="two-factor-authentication__actions">
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
		);
	}
}

export default connect(
	( state ) => ( {
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		isSecurityKeySupported: isTwoFactorAuthTypeSupported( state, 'webauthn' ),
	} ),
	{
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( TwoFactorActions ) );
