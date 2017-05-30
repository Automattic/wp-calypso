/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import {
	isTwoFactorAuthTypeSupported,
} from 'state/login/selectors';
import { sendSmsCode } from 'state/login/actions';
import { login } from 'lib/paths';

class TwoFactorActions extends Component {
	static propTypes = {
		isAuthenticatorSupported: PropTypes.bool.isRequired,
		isPushSupported: PropTypes.bool.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	sendSmsCode = ( event ) => {
		event.preventDefault();

		page( login( { isNative: true, twoFactorAuthType: 'sms' } ) );

		this.props.sendSmsCode( );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isPushSupported,
			isSmsSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		if ( twoFactorAuthType === 'sms' && ! isAuthenticatorSupported && ! isPushSupported ) {
			return null;
		}

		return (
			<Card className="two-factor-authentication__form-action is-compact">
				<p>
					{ translate( 'Or continue to your account using:' ) }
				</p>

				{ isSmsSupported && twoFactorAuthType !== 'sms' && (
					<p>
						<a href="#" onClick={ this.sendSmsCode }>
							{ translate( 'Code via text message' ) }
						</a>
					</p>
				) }

				{ isAuthenticatorSupported && twoFactorAuthType !== 'authenticator' && (
					<p>
						<a href={ login( { isNative: true, twoFactorAuthType: 'authenticator' } ) }>
							{ translate( 'Your Authenticator app' ) }
						</a>
					</p>
				) }

				{ isPushSupported && twoFactorAuthType !== 'push' && (
					<p>
						<a href={ login( { isNative: true, twoFactorAuthType: 'push' } ) }>
							{ translate( 'The WordPress mobile app' ) }
						</a>
					</p>
				) }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isPushSupported: isTwoFactorAuthTypeSupported( state, 'push' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
	} ),
	{
		sendSmsCode,
	}
)( localize( TwoFactorActions ) );
