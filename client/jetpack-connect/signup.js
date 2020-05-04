/**
 * Handle log in and sign up as part of the Jetpack Connect flow
 *
 * When this component receives a bearer token after attempting to create a new
 * user, it renders a <WpcomLoginForm />, which handles logging in the new user
 * and redirection.
 */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AuthFormHeader from './auth-form-header';
import HelpButton from './help-button';
import LocaleSuggestions from 'components/locale-suggestions';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import MainWrapper from './main-wrapper';
import SignupForm from 'blocks/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import { addQueryArgs } from 'lib/route';
import { authQueryPropTypes } from './utils';
import {
	errorNotice as errorNoticeAction,
	warningNotice as warningNoticeAction,
} from 'state/notices/actions';
import { isEnabled } from 'config';
import { login } from 'lib/paths';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import {
	createAccount as createAccountAction,
	createSocialAccount as createSocialAccountAction,
} from 'state/jetpack-connect/actions';
import LoginBlock from 'blocks/login';
import Gridicon from 'components/gridicon';
import { decodeEntities } from 'lib/formatting';
import {
	getRequestError,
	getLastCheckedUsernameOrEmail,
	getAuthAccountType,
} from 'state/login/selectors';
import { resetAuthAccountType as resetAuthAccountTypeAction } from 'state/login/actions';
import FormattedHeader from 'components/formatted-header';
import wooDnaConfig from './woo-dna-config';

const debug = debugFactory( 'calypso:jetpack-connect:authorize-form' );

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

	static initialState = Object.freeze( {
		isCreatingAccount: false,
		newUsername: null,
		bearerToken: null,
		showWooDnaLoginForm: true,
	} );

	state = this.constructor.initialState;

	resetState() {
		this.setState( this.constructor.initialState );
	}

	UNSAFE_componentWillMount() {
		const { from, clientId } = this.props.authQuery;
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view', {
			from,
			site: clientId,
		} );
	}

	componentDidMount() {
		const { from, clientId } = this.props.authQuery;
		this.props.recordTracksEvent( 'calypso_jpc_signup_view', {
			from,
			site: clientId,
		} );
	}

	componentDidUpdate( prevProps ) {
		const { requestError } = this.props;

		if ( prevProps.requestError || ! requestError ) {
			return;
		}

		if (
			this.getWooDnaConfig() &&
			'usernameOrEmail' === requestError.field &&
			'unknown_user' === requestError.code
		) {
			this.showWooDnaSignupView();
		}
	}

	showWooDnaSignupView = () => {
		this.setState( {
			showWooDnaLoginForm: false,
		} );
		this.props.resetAuthAccountType();
	};

	showWooDnaLoginView = ( usernameOrEmail ) => {
		this.setState( {
			showWooDnaLoginForm: true,
			signUpUsernameOrEmail: usernameOrEmail || null,
		} );
		this.props.resetAuthAccountType();
	};

	isWoo() {
		const { authQuery } = this.props;
		return 'woocommerce-onboarding' === authQuery.from;
	}

	getWooDnaConfig() {
		const { authQuery } = this.props;
		return wooDnaConfig[ authQuery.from ];
	}

	getLoginRoute() {
		const emailAddress = this.props.authQuery.userEmail;
		return login( {
			emailAddress,
			from: this.props.authQuery.from,
			isJetpack: true,
			isNative: isEnabled( 'login/native-login-links' ),
			locale: this.props.locale,
			redirectTo: window.location.href,
		} );
	}

	handleSubmitSignup = ( _, userData, analyticsData, afterSubmit = noop ) => {
		debug( 'submitting new account', userData );
		this.setState( { isCreatingAccount: true }, () =>
			this.props
				.createAccount( { ...userData, extra: { ...userData.extra, jpc: true } } )
				.then( this.handleUserCreationSuccess, this.handleUserCreationError )
				.finally( afterSubmit )
		);
	};

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 *
	 * @see client/signup/steps/user/index.jsx
	 *
	 * @param {string} service      The name of the social service
	 * @param {string} access_token An OAuth2 acccess token
	 * @param {string} id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 */
	handleSocialResponse = ( service, access_token, id_token = null ) => {
		debug( 'submitting new social account' );
		this.setState( { isCreatingAccount: true }, () =>
			this.props
				.createSocialAccount( { service, access_token, id_token } )
				.then( this.handleUserCreationSuccess, this.handleUserCreationError )
		);
	};

	/**
	 * Handle user creation result
	 *
	 * @param {object} _             …
	 * @param {string} _.username    Username
	 * @param {string} _.bearerToken Bearer token
	 */
	handleUserCreationSuccess = ( { username, bearerToken } ) => {
		this.setState( {
			newUsername: username,
			bearerToken,
			isCreatingAccount: false,
		} );
	};

	/**
	 * Handle error on user creation
	 *
	 * @param {?object} error Error result
	 */
	handleUserCreationError = ( error ) => {
		const { errorNotice, translate, warningNotice } = this.props;
		debug( 'Signup error: %o', error );
		this.resetState();
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
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ this.getLoginRoute() }>
					{ this.props.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>
				<HelpButton />
			</LoggedOutFormLinks>
		);
	}

	renderWooDna() {
		const { authQuery, isFullLoginFormVisible, translate, usernameOrEmail } = this.props;
		const { isCreatingAccount, signUpUsernameOrEmail } = this.state;
		let header, subHeader, content;
		const footerLinks = [];
		const email = signUpUsernameOrEmail || usernameOrEmail || authQuery.userEmail;
		const wooDna = this.getWooDnaConfig();
		let pageTitle;

		if ( this.state.showWooDnaLoginForm ) {
			if ( isFullLoginFormVisible ) {
				header = translate( 'Log in to your WordPress.com account' );
				/* translators: pluginName is the name of the Woo extension that initiated the connection flow */
				subHeader = translate(
					'Your account will enable you to start using the features and benefits offered by %(pluginName)s',
					{
						args: {
							pluginName: wooDna.name( translate ),
						},
					}
				);
				pageTitle = translate( 'Login to WordPress.com' );
				footerLinks.push(
					<LoggedOutFormLinkItem key="signup" onClick={ this.showWooDnaSignupView }>
						{ this.props.translate( 'Create a new account' ) }
					</LoggedOutFormLinkItem>
				);
				footerLinks.push(
					<LoggedOutFormLinkItem
						key="lostpassword"
						href={ addQueryArgs(
							{ action: 'lostpassword' },
							login( { locale: this.props.locale } )
						) }
					>
						{ this.props.translate( 'Lost your password?' ) }
					</LoggedOutFormLinkItem>
				);
			} else {
				header = wooDna.name( translate );
				subHeader = translate( 'Enter your email address to get started' );
				pageTitle = translate( 'Connect' );
			}
		} else {
			header = wooDna.name( translate );
			subHeader = translate( 'Create an account' );
			pageTitle = translate( 'Create a WordPress.com account' );
			footerLinks.push(
				<LoggedOutFormLinkItem key="login" onClick={ () => this.showWooDnaLoginView() }>
					{ this.props.translate( 'Log in with an existing WordPress.com account' ) }
				</LoggedOutFormLinkItem>
			);
		}

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
		const footer = <LoggedOutFormLinks>{ footerLinks }</LoggedOutFormLinks>;

		if ( this.state.showWooDnaLoginForm ) {
			content = <LoginBlock locale={ this.props.locale } footer={ footer } userEmail={ email } />;
		} else {
			content = (
				<SignupForm
					disabled={ isCreatingAccount }
					email={ includes( email, '@' ) ? email : '' }
					footerLink={ footer }
					handleLogin={ this.showWooDnaLoginView }
					handleSocialResponse={ this.handleSocialResponse }
					isSocialSignupEnabled={ isEnabled( 'signup/social' ) }
					locale={ this.props.locale }
					redirectToAfterLoginUrl={ addQueryArgs( { auth_approved: true }, window.location.href ) }
					submitButtonText={ this.props.translate( 'Create your account' ) }
					submitForm={ this.handleSubmitSignup }
					submitting={ isCreatingAccount }
					suggestedUsername={ includes( email, '@' ) ? '' : email }
				/>
			);
		}

		return (
			<MainWrapper wooDna={ wooDna } pageTitle={ wooDna.name( translate ) + ' — ' + pageTitle }>
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
		if ( this.getWooDnaConfig() ) {
			return this.renderWooDna();
		}
		const { isCreatingAccount } = this.state;
		return (
			<MainWrapper isWoo={ this.isWoo() }>
				<div className="jetpack-connect__authorize-form">
					{ this.renderLocaleSuggestions() }
					<AuthFormHeader authQuery={ this.props.authQuery } isWoo={ this.isWoo() } />
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
						submitButtonText={ this.props.translate( 'Create your account' ) }
						submitForm={ this.handleSubmitSignup }
						submitting={ isCreatingAccount }
						suggestedUsername=""
					/>
					{ this.renderLoginUser() }
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => ( {
		requestError: getRequestError( state ),
		usernameOrEmail: getLastCheckedUsernameOrEmail( state ),
		isFullLoginFormVisible: !! getAuthAccountType( state ),
	} ),
	{
		createAccount: createAccountAction,
		createSocialAccount: createSocialAccountAction,
		errorNotice: errorNoticeAction,
		recordTracksEvent: recordTracksEventAction,
		warningNotice: warningNoticeAction,
		resetAuthAccountType: resetAuthAccountTypeAction,
	}
);

export default flowRight( connectComponent, localize )( JetpackSignup );
