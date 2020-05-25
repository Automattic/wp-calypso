/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { capitalize, get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import config from 'config';
import {
	getRequestNotice,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
	isTwoFactorAuthTypeSupported,
	getSocialAccountIsLinking,
	getSocialAccountLinkService,
} from 'state/login/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { wasManualRenewalImmediateLoginAttempted } from 'state/immediate-login/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getPartnerSlugFromQuery from 'state/selectors/get-partner-slug-from-query';
import { rebootAfterLogin } from 'state/login/actions';
import {
	isCrowdsignalOAuth2Client,
	isJetpackCloudOAuth2Client,
	isWooOAuth2Client,
} from 'lib/oauth2-clients';
import { login } from 'lib/paths';
import Notice from 'components/notice';
import AsyncLoad from 'components/async-load';
import VisitSite from 'blocks/visit-site';
import WooCommerceConnectCartHeader from 'extensions/woocommerce/components/woocommerce-connect-cart-header';
import ContinueAsUser from './continue-as-user';
import ErrorNotice from './error-notice';
import LoginForm from './login-form';
import { isWebAuthnSupported } from 'lib/webauthn';
import JetpackLogo from 'components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';

class Login extends Component {
	static propTypes = {
		disableAutoFocus: PropTypes.bool,
		isLinking: PropTypes.bool,
		isJetpack: PropTypes.bool.isRequired,
		isGutenboarding: PropTypes.bool.isRequired,
		isJetpackWooCommerceFlow: PropTypes.bool.isRequired,
		isManualRenewalImmediateLoginAttempt: PropTypes.bool,
		linkingSocialService: PropTypes.string,
		oauth2Client: PropTypes.object,
		privateSite: PropTypes.bool,
		rebootAfterLogin: PropTypes.func.isRequired,
		requestNotice: PropTypes.object,
		socialConnect: PropTypes.bool,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		twoFactorAuthType: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,
		isSecurityKeySupported: PropTypes.bool,
	};

	state = {
		isBrowserSupported: isWebAuthnSupported(),
		continueAsAnotherUser: false,
	};

	static defaultProps = {
		isJetpack: false,
		isGutenboarding: false,
		isJetpackWooCommerceFlow: false,
	};

	componentDidMount() {
		if ( ! this.props.twoFactorEnabled && this.props.twoFactorAuthType ) {
			// Disallow access to the 2FA pages unless the user has 2FA enabled
			page( login( { isNative: true, isJetpack: this.props.isJetpack } ) );
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

	showContinueAsUser = () => {
		const {
			isJetpack,
			isJetpackWooCommerceFlow,
			oauth2Client,
			privateSite,
			socialConnect,
			twoStepNonce,
			fromSite,
			currentUser,
			twoFactorEnabled,
		} = this.props;

		return (
			! twoStepNonce &&
			! socialConnect &&
			! privateSite &&
			! oauth2Client &&
			! ( config.isEnabled( 'jetpack/connect/woocommerce' ) && isJetpackWooCommerceFlow ) &&
			! isJetpack &&
			! fromSite &&
			! twoFactorEnabled &&
			currentUser &&
			! this.state.continueAsAnotherUser
		);
	};

	handleValidLogin = () => {
		if ( this.props.twoFactorEnabled ) {
			let defaultAuthType;
			if (
				this.state.isBrowserSupported &&
				this.props.isSecurityKeySupported &&
				this.props.twoFactorNotificationSent !== 'push'
			) {
				defaultAuthType = 'webauthn';
			} else {
				defaultAuthType = this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' );
			}
			page(
				login( {
					isNative: true,
					isJetpack: this.props.isJetpack,
					isGutenboarding: this.props.isGutenboarding,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: defaultAuthType,
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

	handleContinueAsAnotherUser = () => {
		this.setState( { continueAsAnotherUser: true } );
	};

	rebootAfterLogin = () => {
		this.props.rebootAfterLogin( {
			social_service_connected: this.props.socialConnect,
		} );
	};

	renderHeader() {
		const {
			isJetpack,
			isGutenboarding,
			isJetpackWooCommerceFlow,
			wccomFrom,
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

			if ( isWooOAuth2Client( oauth2Client ) && ! wccomFrom ) {
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

			if (
				config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
				isWooOAuth2Client( oauth2Client ) &&
				wccomFrom
			) {
				preHeader = (
					<Fragment>
						{ 'cart' === wccomFrom ? (
							<WooCommerceConnectCartHeader />
						) : (
							<div className="login__woocommerce-wrapper">
								<div className={ classNames( 'login__woocommerce-logo' ) }>
									<svg width={ 200 } viewBox={ '0 0 1270 170' }>
										<AsyncLoad
											require="components/jetpack-header/woocommerce"
											darkColorScheme={ false }
											placeholder={ null }
										/>
									</svg>
								</div>
							</div>
						) }
					</Fragment>
				);
				headerText = translate( 'Log in with a WordPress.com account' );
				postHeader = (
					<p className="login__header-subtitle">
						{ translate(
							'Log in to WooCommerce.com with your WordPress.com account to connect your store and manage your extensions'
						) }
					</p>
				);
			}

			if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
				headerText = translate( 'Log in to Jetpack.com with your WordPress.com account.' );
				preHeader = (
					<div className="login__jetpack-cloud-wrapper">
						<JetpackLogo full={ false } size={ 60 } />
					</div>
				);
			}

			if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				headerText = translate( 'Sign in to %(clientTitle)s', {
					args: {
						clientTitle: oauth2Client.title,
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
			headerText = translate( 'Log in or create a WordPress.com account to set up Jetpack' );
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

		if ( isGutenboarding ) {
			preHeader = (
				<div className="login__form-gutenboarding-wordpress-logo">
					<svg
						aria-hidden="true"
						role="img"
						focusable="false"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 20 20"
					>
						<path d="M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10c.24-.64.74-1.87.43-4.25.7 1.29 1.05 2.71 1.05 4.25 0 3.29-1.73 6.24-4.4 7.78.97-2.59 1.94-5.2 2.92-7.78zM6.1 18.09C3.12 16.65 1.11 13.53 1.11 10c0-1.3.23-2.48.72-3.59C3.25 10.3 4.67 14.2 6.1 18.09zm4.03-6.63l2.58 6.98c-.86.29-1.76.45-2.71.45-.79 0-1.57-.11-2.29-.33.81-2.38 1.62-4.74 2.42-7.1z"></path>
					</svg>
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
			domain,
			isJetpack,
			isGutenboarding,
			privateSite,
			twoFactorAuthType,
			twoFactorEnabled,
			twoFactorNotificationSent,
			socialConnect,
			socialService,
			socialServiceResponse,
			disableAutoFocus,
			locale,
		} = this.props;

		if ( twoFactorEnabled ) {
			return (
				<AsyncLoad
					require="blocks/login/two-factor-authentication/two-factor-content"
					isBrowserSupported={ this.state.isBrowserSupported }
					isJetpack={ isJetpack }
					isGutenboarding={ isGutenboarding }
					twoFactorAuthType={ twoFactorAuthType }
					twoFactorNotificationSent={ twoFactorNotificationSent }
					handleValid2FACode={ this.handleValid2FACode }
					rebootAfterLogin={ this.rebootAfterLogin }
				/>
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

		if ( this.showContinueAsUser() ) {
			// someone is already logged in, offer to proceed to the app without a new login
			return <ContinueAsUser onChangeAccount={ this.handleContinueAsAnotherUser } />;
		}

		return (
			<LoginForm
				disableAutoFocus={ disableAutoFocus }
				onSuccess={ this.handleValidLogin }
				privateSite={ privateSite }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
				domain={ domain }
				isJetpack={ isJetpack }
				isGutenboarding={ isGutenboarding }
				locale={ locale }
			/>
		);
	}

	renderFooter() {
		return ! this.showContinueAsUser() && this.props.footer;
	}

	render() {
		const { isJetpack, oauth2Client } = this.props;
		return (
			<div
				className={ classNames( 'login', {
					'is-jetpack': isJetpack,
					'is-jetpack-cloud': isJetpackCloudOAuth2Client( oauth2Client ),
				} ) }
			>
				{ this.renderHeader() }

				<ErrorNotice />

				{ this.renderNotice() }

				{ this.renderContent() }

				{ this.renderFooter() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
		requestNotice: getRequestNotice( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
		oauth2Client: getCurrentOAuth2Client( state ),
		isLinking: getSocialAccountIsLinking( state ),
		isManualRenewalImmediateLoginAttempt: wasManualRenewalImmediateLoginAttempted( state ),
		isSecurityKeySupported: isTwoFactorAuthTypeSupported( state, 'webauthn' ),
		linkingSocialService: getSocialAccountLinkService( state ),
		partnerSlug: getPartnerSlugFromQuery( state ),
		isJetpackWooCommerceFlow:
			'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' ),
		wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
	} ),
	{ rebootAfterLogin }
)( localize( Login ) );
