/** @format */

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
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import { isTwoFactorAuthTypeSupported } from 'state/login/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { sendSmsCode } from 'state/login/actions';
import { login } from 'lib/paths';

class TwoFactorActions extends Component {
	static propTypes = {
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
		isU2fSupported: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	sendSmsCode = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_sms_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'sms' } ) );

		this.props.sendSmsCode();
	};

	recordAuthenticatorLinkClick = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_authenticator_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'authenticator' } ) );
	};

	useU2fKey = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_two_factor_switch_to_u2f_link_click' );

		page( login( { isNative: true, twoFactorAuthType: 'u2f' } ) );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isSmsSupported,
			isU2fSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		const isSmsAvailable = isSmsSupported && twoFactorAuthType !== 'sms';
		const isAuthenticatorAvailable =
			isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';
		const isU2fAvailable = isU2fSupported && twoFactorAuthType !== 'u2f';

		if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isU2fAvailable ) {
			return null;
		}

		return (
			<Card className="two-factor-authentication__form-action is-compact">
				<p>{ translate( 'Or continue to your account using:' ) }</p>

				{ isSmsAvailable && (
					<p>
						<button data-e2e-link="2fa-sms-link" onClick={ this.sendSmsCode }>
							{ translate( 'Code via text message' ) }
						</button>
					</p>
				) }

				{ isAuthenticatorAvailable && (
					<p>
						<button data-e2e-link="2fa-otp-link" onClick={ this.recordAuthenticatorLinkClick }>
							{ translate( 'Your authenticator app' ) }
						</button>
					</p>
				) }

				{ isU2fAvailable && (
					<p>
						<button data-e2e-link="2fa-u2f-link" onClick={ this.useU2fKey }>
							{ translate( 'Your universal 2nd factor key' ) }
						</button>
					</p>
				) }
			</Card>
		);
	}
}

export default connect(
	state => ( {
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		isU2fSupported: isTwoFactorAuthTypeSupported( state, 'u2f' ),
	} ),
	{
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( TwoFactorActions ) );
