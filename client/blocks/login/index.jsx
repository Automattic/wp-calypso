/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { includes, capitalize } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ErrorNotice from './error-notice';
import LoginForm from './login-form';
import {
	getRedirectToSanitized,
	getRequestNotice,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
	getSocialAccountIsLinking,
	getSocialAccountLinkService,
} from 'state/login/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import { isWooOAuth2Client } from 'lib/oauth2-clients';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import PushNotificationApprovalPoller from './two-factor-authentication/push-notification-approval-poller';
import userFactory from 'lib/user';
import SocialConnectPrompt from './social-connect-prompt';
import JetpackLogo from 'components/jetpack-logo';
import { isEnabled } from 'config';

const user = userFactory();

class Login extends Component {
	static propTypes = {
		disableAutoFocus: PropTypes.bool,
		isLinking: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		linkingSocialService: PropTypes.string,
		oauth2Client: PropTypes.object,
		privateSite: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		requestNotice: PropTypes.object,
		socialConnect: PropTypes.bool,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
	};

	static defaultProps = { isJetpack: false };

	componentDidMount = () => {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isNative: true } ) );
		}

		window.scrollTo( 0, 0 );
	};

	componentWillReceiveProps = nextProps => {
		const hasNotice = this.props.requestNotice !== nextProps.requestNotice;
		const isNewPage = this.props.twoFactorAuthType !== nextProps.twoFactorAuthType;

		if ( isNewPage || hasNotice ) {
			window.scrollTo( 0, 0 );
		}
	};

	handleValidLogin = () => {
		if ( this.props.twoFactorEnabled ) {
			page(
				login( {
					isNative: true,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: this.props.twoFactorNotificationSent.replace(
						'none',
						'authenticator'
					),
				} )
			);
		} else if ( this.props.isLinking ) {
			page(
				login( {
					isNative: true,
					socialConnect: true,
				} )
			);
		} else {
			this.rebootAfterLogin();
		}
	};

	handleValid2FACode = () => {
		if ( this.props.isLinking ) {
			page(
				login( {
					isNative: true,
					socialConnect: true,
				} )
			);
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
		user.clear( () => ( window.location.href = url ) );
	};

	renderHeader() {
		const {
			isJetpack,
			linkingSocialService,
			oauth2Client,
			privateSite,
			socialConnect,
			translate,
			twoStepNonce,
		} = this.props;

		let headerText = translate( 'Log in to your account.' );
		let preHeader = null;
		let postHeader = null;

		if ( twoStepNonce ) {
			headerText = translate( 'Two-Step Authentication' );
		} else if ( socialConnect ) {
			headerText = translate( 'Connect your %(service)s account.', {
				args: {
					service: capitalize( linkingSocialService ),
				},
			} );
		} else if ( privateSite ) {
			headerText = translate( 'This is a private WordPress.com site.' );
		} else if ( oauth2Client ) {
			headerText = translate( 'Howdy! Log in to %(clientTitle)s with your WordPress.com account.', {
				args: {
					clientTitle: oauth2Client.title,
				},
				comment:
					"'clientTitle' is the name of the app that uses WordPress.com authentication (e.g. 'Akismet' or 'VaultPress')",
			} );

			if ( isWooOAuth2Client( oauth2Client ) ) {
				preHeader = <Gridicon icon="my-sites" size={ 72 } />;
				postHeader = (
					<p>
						{ translate(
							'WooCommerce.com now uses WordPress.com Accounts.{{br/}}{{a}}Learn more about the benefits{{/a}}',
							{
								components: {
									a: (
										<a
											href="https://woocommerce.com/2017/01/woocommerce-requires-wordpress-account/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
									br: <br />,
								},
							}
						) }
					</p>
				);
			}
		} else if ( isJetpack && isEnabled( 'jetpack/connection-rebranding' ) ) {
			headerText = translate( 'Log in to your WordPress.com account to set up Jetpack.' );
			preHeader = (
				<div>
					<JetpackLogo full size={ 45 } />
				</div>
			);
		}

		return (
			<div className="login__form-header-wrapper">
				{ preHeader }
				<div className="login__form-header">{ headerText }</div>
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
			socialService,
			socialServiceResponse,
			disableAutoFocus,
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
						twoFactorAuthType={ twoFactorAuthType }
					/>
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
			return <SocialConnectPrompt onSuccess={ this.handleValidLogin } />;
		}

		return (
			<LoginForm
				disableAutoFocus={ disableAutoFocus }
				onSuccess={ this.handleValidLogin }
				privateSite={ privateSite }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
			/>
		);
	}

	render() {
		const { isJetpack } = this.props;
		return (
			<div
				className={ classNames( 'login', {
					'is-jetpack': isJetpack && isEnabled( 'jetpack/connection-rebranding' ),
				} ) }
			>
				{ this.renderHeader() }

				<ErrorNotice />

				{ this.renderNotice() }

				{ this.renderContent() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		redirectTo: getRedirectToSanitized( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		oauth2Client: getCurrentOAuth2Client( state ),
		isLinking: getSocialAccountIsLinking( state ),
		linkingSocialService: getSocialAccountLinkService( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( Login ) );
