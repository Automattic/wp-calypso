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
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	isTwoFactorAuthTypeSupported,
} from 'state/login/selectors';
import { sendSmsCode } from 'state/login/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { login } from 'lib/paths';

class TwoFactorActions extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		isAuthenticatorSupported: PropTypes.bool,
		isSmsSupported: PropTypes.bool,
		successNotice: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string.isRequired,
		twoStepNonce: PropTypes.string.isRequired,
	};

	sendSmsCode = ( event ) => {
		event.preventDefault();

		const { userId, twoStepNonce, translate } = this.props;

		page( login( { twoFactorAuthType: 'sms' } ) );

		this.props.sendSmsCode( userId, twoStepNonce ).then( () => {
			this.props.successNotice( translate( 'Recovery code has been sent.' ) );
		} ).catch( ( errorMesssage ) => {
			this.props.errorNotice( errorMesssage );
		} );
	};

	render() {
		const {
			isAuthenticatorSupported,
			isPushSupported,
			isSmsSupported,
			translate,
			twoFactorAuthType,
		} = this.props;

		return (
			<Card className="two-factor-authentication__form-action is-compact">
				<p>
					{ translate( 'Or continue to your account using:' ) }
				</p>

				{ isSmsSupported && twoFactorAuthType !== 'sms' && (
					<p>
						<a href="#" onClick={ this.sendSmsCode }>{ translate( 'Code via text message' ) }</a>
					</p>
				) }

				{ isAuthenticatorSupported && twoFactorAuthType !== 'authenticator' && (
					<p>
						<a href={ login( { twoFactorAuthType: 'authenticator' } ) }>{ translate( 'An Authenticator application' ) }</a>
					</p>
				) }

				{ isPushSupported && twoFactorAuthType !== 'push' && (
					<p>
						<a href={ login( { twoFactorAuthType: 'push' } ) }>{ translate( 'The WordPress mobile app' ) }</a>
					</p>
				) }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		twoStepNonce: getTwoFactorAuthNonce( state ),
		isAuthenticatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
		isPushSupported: isTwoFactorAuthTypeSupported( state, 'push' ),
		isSmsSupported: isTwoFactorAuthTypeSupported( state, 'sms' ),
		userId: getTwoFactorUserId( state ),
	} ),
	{
		sendSmsCode,
		errorNotice,
		successNotice,
	}
)( localize( TwoFactorActions ) );
