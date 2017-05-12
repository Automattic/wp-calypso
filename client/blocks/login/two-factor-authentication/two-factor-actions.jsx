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
		successNotice: PropTypes.func.isRequired,
		isSmsSupported: PropTypes.bool.isRequired,
		twoStepNonce: PropTypes.string.isRequired,
	};

	state = {
		twoStepCode: ''
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

	verifyWithPush = ( event ) => {
		event.preventDefault();

		page( login( { twoFactorAuthType: 'push' } ) );
	};

	verifyWithAuthenticator = ( event ) => {
		event.preventDefault();

		page( login( { twoFactorAuthType: 'authenticator' } ) );
	};

	render() {
		const {
			isAuthenicatorSupported,
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
						<a href="#" onClick={ this.sendSmsCode }>{ translate( 'Code Via Text Message' ) }</a>
					</p>
				) }

				{ isAuthenicatorSupported && twoFactorAuthType !== 'authenticator' && (
					<p>
						<a href="#" onClick={ this.verifyWithAuthenticator }>{ translate( 'An Authenticator App' ) }</a>
					</p>
				) }

				{ isPushSupported && twoFactorAuthType !== 'push' && (
					<p>
						<a href="#" onClick={ this.verifyWithPush }>{ translate( 'The WordPress Mobile App' ) }</a>
					</p>
				) }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		twoStepNonce: getTwoFactorAuthNonce( state ),
		isAuthenicatorSupported: isTwoFactorAuthTypeSupported( state, 'authenticator' ),
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
