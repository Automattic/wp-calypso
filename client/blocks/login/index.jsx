/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';


/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import LoginForm from './login-form';
import {
	getTwoFactorAuthNonce,
	getRequestError,
	getRequestNotice,
	getTwoFactorSupportedAuthTypes,
	isTwoFactorEnabled
} from 'state/login/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';

const TWO_FACTOR_PRIORITY = { push: 0, authenticator: 1, sms: 2 };

class Login extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		redirectLocation: PropTypes.string,
		requestError: PropTypes.object,
		requestNotice: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		twoStepNonce: PropTypes.string,
	};

	state = {
		rememberMe: false,
	};

	componentDidMount = () => {
		if ( ! this.props.twoStepNonce && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has received a nonce
			page( login( { isNative: true } ) );
		}
	};

	componentWillReceiveProps = ( nextProps ) => {
		const hasError = this.props.requestError !== nextProps.requestError;
		const hasNotice = this.props.requestNotice !== nextProps.requestNotice;
		const isNewPage = this.props.twoFactorAuthType !== nextProps.twoFactorAuthType;

		if ( isNewPage || hasError || hasNotice ) {
			window.scrollTo( 0, 0 );
		}
	};

	handleValidUsernamePassword = () => {
		if ( ! this.props.twoFactorEnabled ) {
			this.rebootAfterLogin();
		} else {
			const { twoFactorSupportedAuthTypes } = this.props;

			const lowestPriority = Math.max(
				twoFactorSupportedAuthTypes.length,
				Object.keys( TWO_FACTOR_PRIORITY ).length
			);

			twoFactorSupportedAuthTypes.sort( ( a, b ) => {
				const aPriority = TWO_FACTOR_PRIORITY.hasOwnProperty( a ) ? TWO_FACTOR_PRIORITY[ a ] : lowestPriority;
				const bPriority = TWO_FACTOR_PRIORITY.hasOwnProperty( b ) ? TWO_FACTOR_PRIORITY[ b ] : lowestPriority;

				return aPriority - bPriority;
			} );

			const twoFactorAuthType = twoFactorSupportedAuthTypes[ 0 ];

			page( login( {
				isNative: true,
				twoFactorAuthType: twoFactorAuthType
			} ) );
		}
	};

	rebootAfterLogin = () => {
		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: this.props.twoFactorEnabled
		} );

		window.location.href = this.props.redirectLocation || window.location.origin;
	};

	renderError() {
		const { requestError } = this.props;

		if ( ! requestError || requestError.field !== 'global' ) {
			return null;
		}

		return (
			<Notice status={ 'is-error' } showDismiss={ false }>
				{ requestError.message }
			</Notice>
		);
	}

	renderNotice() {
		const { requestNotice } = this.props;

		if ( ! requestNotice ) {
			return null;
		}

		return (
			<Notice status={ requestNotice.status } showDismiss={ false }>
				{ requestNotice.message }
			</Notice>
		);
	}

	renderContent() {
		const {
			twoFactorAuthType,
			twoStepNonce,
		} = this.props;

		const {
			rememberMe,
		} = this.state;

		if ( twoStepNonce && includes( [ 'authenticator', 'sms', 'backup' ], twoFactorAuthType ) ) {
			return (
				<VerificationCodeForm
					rememberMe={ rememberMe }
					onSuccess={ this.rebootAfterLogin }
					twoFactorAuthType={ twoFactorAuthType }
				/>
			);
		}

		if ( twoStepNonce && twoFactorAuthType === 'push' ) {
			return (
				<WaitingTwoFactorNotificationApproval onSuccess={ this.rebootAfterLogin } />
			);
		}

		return (
			<LoginForm onSuccess={ this.handleValidUsernamePassword } />
		);
	}

	render() {
		const { translate, twoStepNonce } = this.props;

		return (
			<div>
				<DocumentHead title={ translate( 'Log In', { textOnly: true } ) } />

				<div className="login__form-header">
					{ twoStepNonce ? translate( 'Two-Step Authentication' ) : translate( 'Log in to your account.' ) }
				</div>

				{ this.renderError() }

				{ this.renderNotice() }

				{ this.renderContent() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		requestError: getRequestError( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorSupportedAuthTypes: getTwoFactorSupportedAuthTypes( state ),
		twoStepNonce: getTwoFactorAuthNonce( state ),
	} ), {
		recordTracksEvent,
	}
)( localize( Login ) );
