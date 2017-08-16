/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { includes, capitalize } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import ErrorNotice from './error-notice';
import LoginForm from './login-form';
import {
	getRedirectTo,
	getRequestNotice,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
	getSocialAccountIsLinking,
	getSocialAccountLinkService,
} from 'state/login/selectors';
import { getOAuth2ClientData } from 'state/login/oauth2/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import PushNotificationApprovalPoller from './two-factor-authentication/push-notification-approval-poller';
import userFactory from 'lib/user';
import SocialConnectPrompt from './social-connect-prompt';

const user = userFactory();

class Login extends Component {
	static propTypes = {
		oauth2ClientData: PropTypes.object,
		privateSite: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		requestNotice: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		socialConnect: PropTypes.bool,
		isLinking: PropTypes.bool,
		linkingSocialService: PropTypes.string,
	};

	componentDidMount = () => {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isNative: true } ) );
		}

		window.scrollTo( 0, 0 );
	};

	componentWillReceiveProps = ( nextProps ) => {
		const hasNotice = this.props.requestNotice !== nextProps.requestNotice;
		const isNewPage = this.props.twoFactorAuthType !== nextProps.twoFactorAuthType;

		if ( isNewPage || hasNotice ) {
			window.scrollTo( 0, 0 );
		}
	};

	handleValidLogin = () => {
		if ( this.props.twoFactorEnabled ) {
			page( login( {
				isNative: true,
				// If no notification is sent, the user is using the authenticator for 2FA by default
				twoFactorAuthType: this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' )
			} ) );
		} else if ( this.props.isLinking ) {
			page( login( {
				isNative: true,
				socialConnect: true,
			} ) );
		} else {
			this.rebootAfterLogin();
		}
	};

	handleValid2FACode = () => {
		if ( this.props.isLinking ) {
			page( login( {
				isNative: true,
				socialConnect: true,
			} ) );
		} else {
			this.rebootAfterLogin();
		}
	};

	rebootAfterLogin = () => {
		const { redirectTo } = this.props;

		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: this.props.twoFactorEnabled,
			social_service_connected: this.props.socialConnect,
		} );

		// Redirects to / if no redirect url is available
		const url = redirectTo ? redirectTo : window.location.origin;

		// user data is persisted in localstorage at `lib/user/user` line 157
		// therefor we need to reset it before we redirect, otherwise we'll get
		// mixed data from old and new user
		user.clear();

		window.location.href = url;
	};

	renderHeader() {
		const {
			oauth2ClientData,
			privateSite,
			socialConnect,
			translate,
			twoStepNonce,
			linkingSocialService,
		} = this.props;

		let headerText = translate( 'Log in to your account.' ),
			preHeader = null,
			postHeader = null;

		if ( twoStepNonce ) {
			headerText = translate( 'Two-Step Authentication' );
		} else if ( socialConnect ) {
			headerText = translate( 'Connect your %(service)s account.', {
				args: {
					service: capitalize( linkingSocialService ),
				}
			} );
		} else if ( privateSite ) {
			headerText = translate( 'This is a private WordPress.com site.' );
		} else if ( oauth2ClientData ) {
			headerText = translate( 'Howdy! Log in to %(clientTitle)s with your WordPress.com account.', {
				args: {
					clientTitle: oauth2ClientData.title
				}
			} );
			if ( oauth2ClientData.name === 'woo' ) {
				preHeader = (
					<Gridicon icon="my-sites" size={ 72 } />
				);
				postHeader = (
					<p>
						{ translate( 'WooCommerce.com now uses WordPress.com Accounts. {{a}}Learn more about the benefits{{/a}}', {
							components: {
								a: <a href="https://woocommerce.com/2017/01/woocommerce-requires-wordpress-account/" />
							}
						} ) }
					</p>
				);
			}
		}

		return (
			<div className="login__form-header-wrapper">
				{ preHeader }
				<div className="login__form-header">
					{ headerText }
				</div>
				{ postHeader }
			</div>
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
			privateSite,
			twoFactorAuthType,
			twoFactorEnabled,
			twoFactorNotificationSent,
			socialConnect,
		} = this.props;

		let poller;
		if ( twoFactorEnabled && twoFactorAuthType && twoFactorNotificationSent === 'push' ) {
			poller = <PushNotificationApprovalPoller onSuccess={ this.rebootAfterLogin } />;
		}

		if ( twoFactorEnabled && includes( [ 'authenticator', 'sms', 'backup' ], twoFactorAuthType ) ) {
			return (
				<div>
					{ poller }
					<VerificationCodeForm
						onSuccess={ this.handleValid2FACode }
						twoFactorAuthType={ twoFactorAuthType } />
				</div>
			);
		}

		if ( twoFactorEnabled && twoFactorAuthType === 'push' ) {
			return (
				<div>
					{ poller }
					<WaitingTwoFactorNotificationApproval />
				</div>
			);
		}

		if ( socialConnect ) {
			return (
				<SocialConnectPrompt onSuccess={ this.handleValidLogin } />
			);
		}

		return (
			<LoginForm onSuccess={ this.handleValidLogin } privateSite={ privateSite } />
		);
	}

	render() {
		return (
			<div>
				{ this.renderHeader() }

				<ErrorNotice />

				{ this.renderNotice() }

				{ this.renderContent() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getRedirectTo( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		oauth2ClientData: getOAuth2ClientData( state ),
		isLinking: getSocialAccountIsLinking( state ),
		linkingSocialService: getSocialAccountLinkService( state ),
	} ), {
		recordTracksEvent,
	}
)( localize( Login ) );
