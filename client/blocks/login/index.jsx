/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { includes, capitalize, get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
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
import { wasManualRenewalImmediateLoginAttempted } from 'state/immediate-login/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getPartnerSlugFromQuery from 'state/selectors/get-partner-slug-from-query';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'lib/oauth2-clients';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import VerificationCodeForm from './two-factor-authentication/verification-code-form';
import WaitingTwoFactorNotificationApproval from './two-factor-authentication/waiting-notification-approval';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import PushNotificationApprovalPoller from './two-factor-authentication/push-notification-approval-poller';
import userFactory from 'lib/user';
import AsyncLoad from 'components/async-load';
import VisitSite from 'blocks/visit-site';

/**
 * Style dependencies
 */
import './style.scss';

const user = userFactory();

class Login extends Component {
	static propTypes = {
		disableAutoFocus: PropTypes.bool,
		isLinking: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isJetpackWooCommerceFlow: PropTypes.bool.isRequired,
		isManualRenewalImmediateLoginAttempt: PropTypes.bool,
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

	static defaultProps = { isJetpack: false, isJetpackWooCommerceFlow: false };

	componentDidMount() {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isNative: true } ) );
		}

		window.scrollTo( 0, 0 );
	}

	componentDidUpdate( prevProps ) {
		const hasNotice = this.props.requestNotice !== prevProps.requestNotice;
		const isNewPage = this.props.twoFactorAuthType !== prevProps.twoFactorAuthType;

		if ( isNewPage || hasNotice ) {
			window.scrollTo( 0, 0 );
		}
	}

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
			isJetpackWooCommerceFlow,
			isManualRenewalImmediateLoginAttempt,
			linkingSocialService,
			oauth2Client,
			privateSite,
			socialConnect,
			translate,
			twoStepNonce,
			fromSite,
		} = this.props;

		let headerText = translate( 'Log in to your account' );
		let preHeader = null;
		let postHeader = null;

		if ( isManualRenewalImmediateLoginAttempt ) {
			headerText = translate( 'Log in to update your payment details and renew your subscription' );
		}

		if ( twoStepNonce ) {
			headerText = translate( 'Two-Step Authentication' );
		} else if ( socialConnect ) {
			headerText = translate( 'Connect your %(service)s account', {
				args: {
					service: capitalize( linkingSocialService ),
				},
			} );
		} else if ( privateSite ) {
			headerText = translate( 'This is a private WordPress.com site' );
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

			if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				headerText = translate( 'Howdy!{{br/}}Log in to %(clientTitle)s:', {
					args: {
						clientTitle: oauth2Client.title,
					},
					components: {
						br: <br />,
					},
				} );
			}
		} else if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && isJetpackWooCommerceFlow ) {
			headerText = translate( 'Log in to your WordPress.com account' );
			preHeader = (
				<div className="login__jetpack-logo">
					<AsyncLoad
						require="components/jetpack-header"
						placeholder={ null }
						partnerSlug={ this.props.partnerSlug }
						isWoo
						width={ 200 }
						lightColorScheme
					/>
				</div>
			);
			postHeader = (
				<p className="login__header-subtitle">
					{ translate(
						'Your account will enable you to start using the features and benefits offered by Jetpack & WooCommerce Services.'
					) }
				</p>
			);
		} else if ( isJetpack ) {
			headerText = translate( 'Log in to your WordPress.com account to set up Jetpack' );
			preHeader = (
				<div className="login__jetpack-logo">
					<AsyncLoad
						require="components/jetpack-header"
						placeholder={ null }
						partnerSlug={ this.props.partnerSlug }
						darkColorScheme
					/>
				</div>
			);
		} else if ( fromSite ) {
			// if redirected from Calypso URL with a site slug, offer a link to that site's frontend
			postHeader = <VisitSite siteSlug={ fromSite } />;
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
			domain,
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
			return (
				<AsyncLoad
					require="blocks/login/social-connect-prompt"
					onSuccess={ this.handleValidLogin }
				/>
			);
		}

		return (
			<LoginForm
				disableAutoFocus={ disableAutoFocus }
				onSuccess={ this.handleValidLogin }
				privateSite={ privateSite }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
			/>
		);
	}

	render() {
		const { isJetpack } = this.props;
		return (
			<div className={ classNames( 'login', { 'is-jetpack': isJetpack } ) }>
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
		isManualRenewalImmediateLoginAttempt: wasManualRenewalImmediateLoginAttempted( state ),
		linkingSocialService: getSocialAccountLinkService( state ),
		partnerSlug: getPartnerSlugFromQuery( state ),
		isJetpackWooCommerceFlow:
			'woocommerce-setup-wizard' === get( getCurrentQueryArguments( state ), 'from' ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( Login ) );
