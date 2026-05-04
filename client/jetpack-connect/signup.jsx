/**
 * Handle log in and sign up as part of the Jetpack Connect flow
 *
 * When this component receives a bearer token after attempting to create a new
 * user, it renders a <WpcomLoginForm />, which handles logging in the new user
 * and redirection.
 */

import { isEnabled } from '@automattic/calypso-config';
import { Modal } from '@wordpress/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import JetpackConnectSiteOnly from 'calypso/blocks/jetpack-connect-site-only';
import SignupForm from 'calypso/blocks/signup-form';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
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

	renderFooterLink() {
		const { authQuery } = this.props;

		if ( this.isWooJPC() ) {
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

	render() {
		const { isCreatingAccount, newUsername, bearerToken } = this.state;
		const isWooJPC = this.isWooJPC();

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
				isWooJPC={ isWooJPC }
				isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
			>
				<div className="jetpack-connect__authorize-form">
					{ this.renderLocaleSuggestions() }
					<AuthFormHeader
						authQuery={ this.props.authQuery }
						isWooJPC={ isWooJPC }
						isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
						disableSiteCard={ isWooJPC }
						wooDnaConfig={ this.getWooDnaConfig() }
					/>
					<SignupForm
						disabled={ isCreatingAccount }
						isPasswordless={ isWooJPC }
						disableTosText={ isWooJPC }
						labelText={ isWooJPC ? this.props.translate( 'Your Email' ) : null }
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
							isWooJPC
								? this.props.translate( 'Create an account' )
								: this.props.translate( 'Create your account' )
						}
						submitForm={ this.handleSubmitSignup }
						submitting={ isCreatingAccount }
						suggestedUsername=""
					/>

					{ this.renderLoginUser() }
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
