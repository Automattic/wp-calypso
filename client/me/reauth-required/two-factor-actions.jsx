/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */

import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { recordTracksEventWithClientId } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './two-factor-actions.scss';

class TwoFactorActions extends Component {
	static propTypes = {
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isSecurityKeySupported: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
		isSmsAllowed: PropTypes.bool.isRequired,
		onChange: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,

		recordTracksEventWithClientId: PropTypes.func.isRequired,

		translate: PropTypes.func.isRequired,
	};

	recordButtonClicked = ( event ) => {
		event.preventDefault();
		let tracksEvent;

		switch ( event.target.value ) {
			case 'sms':
				tracksEvent = 'calypso_twostep_reauth_sms_clicked';
				break;
			case 'authenticator':
				tracksEvent = 'calypso_twostep_reauth_authenticator_clicked';
				break;
			case 'webauthn':
				tracksEvent = 'calypso_twostep_reauth_webauthn_clicked';
				break;
		}

		if ( tracksEvent ) {
			this.props.recordTracksEventWithClientId( tracksEvent );
		}

		this.props.onChange( event.target.value );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isSecurityKeySupported,
			isSmsSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		const isSecurityKeyAvailable = isSecurityKeySupported && twoFactorAuthType !== 'webauthn';
		const isSmsAvailable = isSmsSupported;
		const isAuthenticatorAvailable =
			isSecurityKeySupported && isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';

		if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isSecurityKeyAvailable ) {
			return null;
		}

		return (
			<Card className="two-factor-actions__actions">
				{ isSecurityKeyAvailable && (
					<Button
						data-e2e-link="2fa-security-key-link"
						value="webauthn"
						onClick={ this.recordButtonClicked }
					>
						{ translate( 'Continue with your security\u00A0key' ) }
					</Button>
				) }

				{ isAuthenticatorAvailable && (
					<Button
						data-e2e-link="2fa-otp-link"
						value="authenticator"
						onClick={ this.recordButtonClicked }
					>
						{ translate( 'Continue with your authenticator\u00A0app' ) }
					</Button>
				) }

				{ isSmsAvailable && (
					<Button
						data-e2e-link="2fa-sms-link"
						value="sms"
						disabled={ ! this.props.isSmsAllowed }
						onClick={ this.recordButtonClicked }
					>
						{ translate( 'Send code via\u00A0text\u00A0message' ) }
					</Button>
				) }
			</Card>
		);
	}
}

export default connect( null, {
	recordTracksEventWithClientId,
} )( localize( TwoFactorActions ) );
