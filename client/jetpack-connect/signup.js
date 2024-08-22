/**
 * Handle log in and sign up as part of the Jetpack Connect flow
 *
 * When this component receives a bearer token after attempting to create a new
 * user, it renders a <WpcomLoginForm />, which handles logging in the new user
 * and redirection.
 */

import { isEnabled } from '@automattic/calypso-config';
import { Gridicon, JetpackLogo } from '@automattic/components';
import { Button, Card, Modal } from '@wordpress/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { flowRight, get, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import JetpackConnectSiteOnly from 'calypso/blocks/jetpack-connect-site-only';
import LoginBlock from 'calypso/blocks/login';
import SignupForm from 'calypso/blocks/signup-form';
import FormattedHeader from 'calypso/components/formatted-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { decodeEntities } from 'calypso/lib/formatting';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { sendEmailLogin as sendEmailLoginAction } from 'calypso/state/auth/actions';
import {
	createAccount as createAccountAction,
	createSocialAccount as createSocialAccountAction,
} from 'calypso/state/jetpack-connect/actions';
import { resetAuthAccountType as resetAuthAccountTypeAction } from 'calypso/state/login/actions';
import {
	getRequestError,
	getLastCheckedUsernameOrEmail,
	getAuthAccountType,
	getRedirectToOriginal,
} from 'calypso/state/login/selectors';
import {
	errorNotice as errorNoticeAction,
	warningNotice as warningNoticeAction,
} from 'calypso/state/notices/actions';
import AuthFormHeader from './auth-form-header';
import HelpButton from './help-button';
import MainWrapper from './main-wrapper';
import { authQueryPropTypes } from './utils';
import wooDnaConfig from './woo-dna-config';
import WooInstallExtSuccessNotice from './woo-install-ext-success-notice';
import { WooLoader } from './woo-loader';
import { CreatingYourAccountStage } from './woo-loader-stages';

const debug = debugFactory( 'calypso:jetpack-connect:authorize-form' );
const noop = () => {};

export class JetpackSignup extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,
		locale: PropTypes.string,
		path: PropTypes.string,

		// Connected props
		createAccount: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		isCreatingAccount: false,
		newUsername: null,
		bearerToken: null,
		wooDnaFormType: 'login',
	};

	componentDidMount() {
		const { from, clientId } = this.props.authQuery;

		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view', {
			from,
			site: clientId,
		} );

		this.props.recordTracksEvent( 'calypso_jpc_signup_view', {
			from,
			site: clientId,
		} );
	}

	componentDidUpdate( prevProps ) {
		const { loginRequestError } = this.props;

		if ( prevProps.loginRequestError || ! loginRequestError ) {
			return;
		}

		if (
			this.getWooDnaConfig().isWooDnaFlow() &&
			'usernameOrEmail' === loginRequestError.field &&
			'unknown_user' === loginRequestError.code
		) {
			this.showWooDnaSignupView();
		}
	}

	showWooDnaSignupView = () => {
		this.setState( {
			wooDnaFormType: 'signup',
			signUpUsernameOrEmail: null,
		} );
		this.props.resetAuthAccountType();
	};

	showWooDnaLoginView = ( usernameOrEmail ) => {
		this.setState( {
			wooDnaFormType: 'login',
			signUpUsernameOrEmail: usernameOrEmail || null,
			loginSocialConnect: false,
			loginTwoFactorAuthType: null,
		} );
		this.props.resetAuthAccountType();
	};

	isWooOnboarding() {
		const { authQuery } = this.props;
		return 'woocommerce-onboarding' === authQuery.from;
	}

	isWooCoreProfiler( props = this.props ) {
		const { from } = props.authQuery;
		return 'woocommerce-core-profiler' === from;
	}

	getWooDnaConfig() {
		const { authQuery } = this.props;
		return wooDnaConfig( authQuery );
	}

	getFlowName() {
		const wooDna = this.getWooDnaConfig();
		return wooDna.isWooDnaFlow() ? wooDna.getFlowName() : 'jetpack-connect';
	}

	getLoginRoute() {
		const emailAddress = this.props.authQuery.userEmail;
		return login( {
			emailAddress,
			from: this.props.authQuery.from,
			isJetpack: true,
			locale: this.props.locale,
			redirectTo: window.location.href,
			allowSiteConnection: this.props.authQuery?.allowSiteConnection,
			site: this.props.authQuery?.site,
		} );
	}

	isFromAutomatticForAgenciesPlugin() {
		return 'automattic-for-agencies-client' === this.props.authQuery.from;
	}

	handleSubmitSignup = ( _, userData, analyticsData, afterSubmit = noop ) => {
		debug( 'submitting new account', userData );
		this.setState( { isCreatingAccount: true }, () =>
			this.props
				.createAccount( {
					...userData,
					signup_flow_name: this.getFlowName(),
					extra: {
						...userData.extra,
						jpc: true,
					},
				} )
				.then( this.handleUserCreationSuccess, this.handleUserCreationError )
				.finally( afterSubmit )
		);
	};

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 * @see client/signup/steps/user/index.jsx
	 * @param {string} service      The name of the social service
	 * @param {string} access_token An OAuth2 acccess token
	 * @param {string} id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 */
	handleSocialResponse = ( service, access_token, id_token = null ) => {
		debug( 'submitting new social account' );
		this.setState( { isCreatingAccount: true }, () =>
			this.props
				.createSocialAccount( { service, access_token, id_token }, this.getFlowName() )
				.then( this.handleUserCreationSuccess, this.handleUserCreationError )
		);
	};

	/**
	 * Handle user creation result
	 * @param {Object} _             …
	 * @param {string} _.username    Username
	 * @param {string} _.bearerToken Bearer token
	 */
	handleUserCreationSuccess = ( { username, bearerToken } ) => {
		if ( this.isWooCoreProfiler() ) {
			this.props.recordTracksEvent( 'calypso_jpc_wc_coreprofiler_create_account_success' );
		}
		this.setState( {
			newUsername: username,
			bearerToken,
			isCreatingAccount: false,
		} );
	};

	/**
	 * Handle error on user creation
	 * @param {?Object} error Error result
	 */
	handleUserCreationError = ( error ) => {
		const { errorNotice, translate, warningNotice } = this.props;
		debug( 'Signup error: %o', error );
		this.setState( {
			newUsername: null,
			bearerToken: null,
			isCreatingAccount: false,
		} );
		if ( error && 'user_exists' === error.code ) {
			const text =
				error.data && error.data.email
					? // translators: email is an email address. eg you@name.com
					  translate(
							'The email address "%(email)s" is associated with a WordPress.com account. ' +
								'Log in to connect it to your Google profile, or choose a different Google profile.',
							{ args: { email: error.data.email } }
					  )
					: translate(
							'The email address is associated with a WordPress.com account. ' +
								'Log in to connect it to your Google profile, or choose a different Google profile.'
					  );

			warningNotice( text, {
				button: <a href={ this.getLoginRoute() }>{ translate( 'Log in' ) }</a>,
			} );
			return;
		}
		if ( get( error, [ 'error' ] ) === 'password_invalid' ) {
			errorNotice( error.message, { id: 'user-creation-error-password_invalid' } );
			return;
		}
		errorNotice(
			translate( 'There was a problem creating your account. Please contact support.' )
		);
	};

	renderLoginUser() {
		const { newUsername, bearerToken } = this.state;
		return (
			newUsername &&
			bearerToken && (
				<WpcomLoginForm
					authorization={ 'Bearer ' + bearerToken }
					emailAddress={ this.props.authQuery.userEmail }
					log={ newUsername }
					redirectTo={ addQueryArgs( { auth_approved: true }, window.location.href ) }
				/>
			)
		);
	}

	renderLocaleSuggestions() {
		return this.props.locale ? (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		) : null;
	}

	renderFooterLink() {
		const { authQuery } = this.props;

		if ( this.isWooCoreProfiler() ) {
			return null;
		}

		const allowSiteConnection =
			authQuery.allowSiteConnection && ! this.isFromAutomatticForAgenciesPlugin();

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ this.getLoginRoute() }>
					{ this.props.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>

				{ allowSiteConnection && (
					<JetpackConnectSiteOnly
						homeUrl={ authQuery.homeUrl }
						redirectAfterAuth={ authQuery.redirectAfterAuth }
						source="signup"
					/>
				) }

				<HelpButton />
			</LoggedOutFormLinks>
		);
	}

	renderWooDnaFooter( footerLinks ) {
		const { authQuery } = this.props;
		footerLinks.push(
			<LoggedOutFormLinkItem key="back" href={ authQuery.redirectAfterAuth }>
				<Gridicon size={ 18 } icon="arrow-left" />{ ' ' }
				{
					// translators: eg: Return to The WordPress.com Blog
					this.props.translate( 'Return to %(sitename)s', {
						args: { sitename: decodeEntities( authQuery.blogname ) },
					} )
				}
			</LoggedOutFormLinkItem>
		);
		return <LoggedOutFormLinks>{ footerLinks }</LoggedOutFormLinks>;
	}

	renderWooDnaLoginMagicLink() {
		const { translate, usernameOrEmail, sendEmailLogin } = this.props;
		return (
			<>
				<Card className="jetpack-connect__magic-link-card">
					<p>
						{ translate( 'We’ve just sent a magic link to {{b}}%(email)s{{/b}}', {
							args: {
								email: usernameOrEmail,
							},
							components: {
								b: <strong />,
							},
						} ) }
					</p>
					<p>{ translate( 'Click the link in the email to connect your store.' ) }</p>
					<img src="/calypso/images/illustrations/illustration-woo-magic-link.svg" alt="" />
					<p className="jetpack-connect__magic-link-resend">
						{ translate( 'This email will expire in an hour. {{a}}Resend it{{/a}}.', {
							components: {
								// eslint-disable-next-line jsx-a11y/anchor-is-valid
								a: <Button isLink onClick={ sendEmailLogin } />,
							},
						} ) }
					</p>
				</Card>
				{ this.renderWooDnaFooter( [
					<LoggedOutFormLinkItem key="login" onClick={ () => this.showWooDnaLoginView() }>
						{ translate( 'Connect with a different email' ) }
					</LoggedOutFormLinkItem>,
				] ) }
			</>
		);
	}

	renderWooDna() {
		const { authQuery, isFullLoginFormVisible, locale, translate, usernameOrEmail } = this.props;
		const { isCreatingAccount, signUpUsernameOrEmail, loginSocialConnect, loginTwoFactorAuthType } =
			this.state;
		let header;
		let subHeader;
		let content;
		const footerLinks = [];
		const email = signUpUsernameOrEmail || usernameOrEmail || authQuery.userEmail;
		const wooDna = this.getWooDnaConfig();
		let pageTitle;

		if ( 'link' === loginTwoFactorAuthType ) {
			// Passwordless link has been sent, nothing else to do here except tell the user.
			header = wooDna.getServiceName();
			subHeader = translate( 'Check your email!' );
			pageTitle = translate( 'Connect' );
			content = this.renderWooDnaLoginMagicLink();
		} else if ( 'login' === this.state.wooDnaFormType ) {
			if ( isFullLoginFormVisible ) {
				header = translate( 'Log in to your WordPress.com account' );
				/* translators: pluginName is the name of the Woo extension that initiated the connection flow */
				subHeader = translate(
					'Your account will enable you to start using the features and benefits offered by %(pluginName)s',
					{
						args: {
							pluginName: wooDna.getServiceName(),
						},
					}
				);
				pageTitle = translate( 'Login to WordPress.com' );
				footerLinks.push(
					<LoggedOutFormLinkItem key="signup" onClick={ this.showWooDnaSignupView }>
						{ translate( 'Create a new account' ) }
					</LoggedOutFormLinkItem>
				);
				footerLinks.push(
					<LoggedOutFormLinkItem key="lostpassword" href={ lostPassword( { locale } ) }>
						{ translate( 'Lost your password?' ) }
					</LoggedOutFormLinkItem>
				);
			} else {
				const pluginName = wooDna.getServiceName();
				header = pluginName;
				if ( wooDna.getFlowName() === 'woodna:woocommerce-payments' ) {
					subHeader = translate(
						'Enter your email address to get started. Your account will enable you to start using the features and benefits offered by WooPayments'
					);
				} else if ( wooDna.getFlowName() === 'woodna:blaze-ads-on-woo' ) {
					/* translators: pluginName is the name of the Woo extension that initiated the connection flow */
					subHeader = translate(
						'Enter your email address to get started. Your account will enable you to start using the features and benefits offered by %(pluginName)s',
						{
							args: {
								pluginName,
							},
						}
					);
				} else {
					subHeader = translate( 'Enter your email address to get started' );
				}
				pageTitle = translate( 'Connect' );
			}
			content = (
				<LoginBlock
					locale={ this.props.locale }
					footer={ this.renderWooDnaFooter( footerLinks ) }
					userEmail={ email }
					socialConnect={ loginSocialConnect }
					twoFactorAuthType={ loginTwoFactorAuthType }
					onTwoFactorRequested={ ( authType ) =>
						this.setState( { loginTwoFactorAuthType: authType } )
					}
					onSocialConnectStart={ () => this.setState( { loginSocialConnect: true } ) }
				/>
			);
		} else {
			// Woo DNA sign-up form
			header = wooDna.getServiceName();
			subHeader = translate( 'Create an account' );
			pageTitle = translate( 'Create a WordPress.com account' );
			footerLinks.push(
				<LoggedOutFormLinkItem key="login" onClick={ () => this.showWooDnaLoginView() }>
					{ this.props.translate( 'Log in with an existing WordPress.com account' ) }
				</LoggedOutFormLinkItem>
			);
			content = (
				<SignupForm
					disabled={ isCreatingAccount }
					email={ includes( email, '@' ) ? email : '' }
					footerLink={ this.renderWooDnaFooter( footerLinks ) }
					handleLogin={ this.showWooDnaLoginView }
					handleSocialResponse={ this.handleSocialResponse }
					isSocialSignupEnabled={ isEnabled( 'signup/social' ) }
					locale={ this.props.locale }
					redirectToAfterLoginUrl={ addQueryArgs( { auth_approved: true }, window.location.href ) }
					submitButtonText={ this.props.translate( 'Create your account' ) }
					submitForm={ this.handleSubmitSignup }
					submitting={ isCreatingAccount }
					suggestedUsername={ includes( email, '@' ) ? '' : email }
					flowName={ this.getFlowName() }
				/>
			);
		}

		return (
			<MainWrapper
				wooDnaConfig={ wooDna }
				pageTitle={ wooDna.getServiceName() + ' — ' + pageTitle }
			>
				<div className="jetpack-connect__authorize-form">
					{ this.renderLocaleSuggestions() }
					<FormattedHeader headerText={ header } subHeaderText={ subHeader } />
					{ content }
					{ this.renderLoginUser() }
				</div>
			</MainWrapper>
		);
	}

	render() {
		if ( this.getWooDnaConfig().isWooDnaFlow() ) {
			return this.renderWooDna();
		}
		const { isCreatingAccount, newUsername, bearerToken } = this.state;
		const isWooCoreProfiler = this.isWooCoreProfiler();

		const isLogging = newUsername && bearerToken;
		if ( isWooCoreProfiler && ( isCreatingAccount || isLogging ) ) {
			return (
				// Wrap the loader in a modal to show it in full screen
				<Modal
					open
					title=""
					overlayClassName="jetpack-connect-woocommerce-loader__modal-overlay"
					className="jetpack-connect-woocommerce-loader__modal"
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					isDismissible={ false }
				>
					<WooLoader stages={ [ CreatingYourAccountStage ] } />
					{ this.renderLoginUser() }
				</Modal>
			);
		}

		return (
			<MainWrapper
				isWooOnboarding={ this.isWooOnboarding() }
				isWooCoreProfiler={ this.isWooCoreProfiler() }
				isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
			>
				<div className="jetpack-connect__authorize-form">
					{ this.renderLocaleSuggestions() }
					<AuthFormHeader
						authQuery={ this.props.authQuery }
						isWooOnboarding={ this.isWooOnboarding() }
						isWooCoreProfiler={ this.isWooCoreProfiler() }
						isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
					/>
					<SignupForm
						disabled={ isCreatingAccount }
						email={ this.props.authQuery.userEmail }
						footerLink={ this.renderFooterLink() }
						handleSocialResponse={ this.handleSocialResponse }
						isSocialSignupEnabled={ isEnabled( 'signup/social' ) }
						locale={ this.props.locale }
						redirectToAfterLoginUrl={ addQueryArgs(
							{ auth_approved: true },
							window.location.href
						) }
						submitButtonText={
							isWooCoreProfiler
								? this.props.translate( 'Create an account' )
								: this.props.translate( 'Create your account' )
						}
						submitForm={ this.handleSubmitSignup }
						submitting={ isCreatingAccount }
						suggestedUsername=""
					/>

					{ this.renderLoginUser() }
				</div>
				{ isWooCoreProfiler && this.props.authQuery.installedExtSuccess && (
					<WooInstallExtSuccessNotice />
				) }
				{ isWooCoreProfiler && (
					<div className="jetpack-connect__jetpack-logo-wrapper">
						<JetpackLogo monochrome size={ 18 } />{ ' ' }
						<span>{ this.props.translate( 'Jetpack powered' ) }</span>
					</div>
				) }
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => ( {
		loginRequestError: getRequestError( state ),
		usernameOrEmail: getLastCheckedUsernameOrEmail( state ),
		isFullLoginFormVisible: !! getAuthAccountType( state ),
		redirectTo: getRedirectToOriginal( state ),
	} ),
	{
		createAccount: createAccountAction,
		createSocialAccount: createSocialAccountAction,
		errorNotice: errorNoticeAction,
		recordTracksEvent: recordTracksEventAction,
		warningNotice: warningNoticeAction,
		resetAuthAccountType: resetAuthAccountTypeAction,
		sendEmailLogin: sendEmailLoginAction,
	},
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		...dispatchProps,
		sendEmailLogin: () =>
			dispatchProps.sendEmailLogin( stateProps.usernameOrEmail, {
				redirectTo: stateProps.redirectTo,
				loginFormFlow: true,
				showGlobalNotices: true,
			} ),
	} )
);

export default flowRight( connectComponent, localize )( JetpackSignup );
