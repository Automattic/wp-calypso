/**
 * Handle log in and sign up as part of the Jetpack Connect flow
 *
 * When this component receives a bearer token after attempting to create a new
 * user, it renders a <WpcomLoginForm />, which handles logging in the new user
 * and redirection.
 */

import { isEnabled } from '@automattic/calypso-config';
import { Modal } from '@wordpress/components';
import clsx from 'clsx';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SignupForm from 'calypso/blocks/signup-form';
import { BrandHeader } from 'calypso/components/connect-screen/brand-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { login } from 'calypso/lib/paths';
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
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import AuthFormHeader from './auth-form-header';
import { getSignupCopy } from './connection-content';
import { getConnectorBranding } from './connector-branding-config';
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
		isWooJPC: PropTypes.bool,
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

	isWooJPC( props = this.props ) {
		const { from } = props.authQuery;

		return (
			'woocommerce-core-profiler' === from ||
			this.props.isWooJPC ||
			this.getWooDnaConfig().isWooDnaFlow()
		);
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

	isFromJetpackConnector( props = this.props ) {
		return 'jetpack-connector' === props.authQuery.from;
	}

	isFromJetpackOnboarding( props = this.props ) {
		return 'jetpack-onboarding' === props.authQuery.from;
	}

	isUnifiedConnectionFlow( props = this.props ) {
		return this.isFromJetpackOnboarding( props ) || this.isFromJetpackConnector( props );
	}

	handleExistingAccountClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_signup_use_existing_account_clicked', {
			from: this.props.authQuery.from,
			site: this.props.authQuery.clientId,
		} );
	};

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
						source: this.isWooJPC() ? 'woo-passwordless-jpc' + '-' + this.props.authQuery.from : '',
						from: this.props.authQuery.from,
						plugins: this.props.authQuery.plugins,
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
		if ( this.isWooJPC() ) {
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

	renderUseExistingAccountLink() {
		if ( ! this.isUnifiedConnectionFlow() ) {
			return null;
		}

		return (
			<p className="jetpack-connect__signup-existing-account">
				{ this.props.translate( 'Already have a WordPress.com account? {{a}}Log in{{/a}}', {
					components: {
						a: <a href={ this.getLoginRoute() } onClick={ this.handleExistingAccountClick } />,
					},
				} ) }
			</p>
		);
	}

	render() {
		const { isCreatingAccount, newUsername, bearerToken } = this.state;
		const isWooJPC = this.isWooJPC();
		const isFromJetpackConnector = this.isFromJetpackConnector();
		const connectorBranding = isFromJetpackConnector
			? getConnectorBranding( this.props.authQuery.plugins )
			: null;
		const signupCopy = isFromJetpackConnector
			? getSignupCopy( this.props.authQuery.plugins )
			: null;

		const isLogging = newUsername && bearerToken;
		if ( isWooJPC && ( isCreatingAccount || isLogging ) ) {
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
				className={ clsx( {
					'jetpack-connect__authorize-form-wrapper--connector': isFromJetpackConnector,
				} ) }
				isWooJPC={ isWooJPC }
				isJetpackConnector={ isFromJetpackConnector }
				isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
			>
				<div className="jetpack-connect__authorize-form">
					{ isFromJetpackConnector && connectorBranding && signupCopy ? (
						<BrandHeader
							logo={ connectorBranding.logo }
							logoAlt=""
							title={ signupCopy.title }
							description={ signupCopy.subtitle }
						/>
					) : (
						<AuthFormHeader
							authQuery={ this.props.authQuery }
							isWooJPC={ isWooJPC }
							isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
							disableSiteCard={ isWooJPC }
							wooDnaConfig={ this.getWooDnaConfig() }
						/>
					) }
					{ this.renderUseExistingAccountLink() }
					<SignupForm
						disabled={ isCreatingAccount }
						isPasswordless={ isWooJPC }
						disableTosText={ isWooJPC }
						labelText={ isWooJPC ? this.props.translate( 'Your Email' ) : null }
						email={ this.props.authQuery.userEmail }
						handleSocialResponse={ this.handleSocialResponse }
						isSocialSignupEnabled={ isEnabled( 'signup/social' ) }
						locale={ this.props.locale }
						redirectToAfterLoginUrl={ addQueryArgs(
							{ auth_approved: true },
							window.location.href
						) }
						submitButtonText={
							isWooJPC
								? this.props.translate( 'Create an account' )
								: this.props.translate( 'Create your account' )
						}
						submitForm={ this.handleSubmitSignup }
						submitting={ isCreatingAccount }
						suggestedUsername=""
					/>

					{ this.renderLoginUser() }
					{ this.renderLocaleSuggestions() }
				</div>
				{ isWooJPC && this.props.authQuery.installedExtSuccess && <WooInstallExtSuccessNotice /> }
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
		isWooJPC: isWooJPCFlow( state ),
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
