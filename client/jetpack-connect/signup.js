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
import { flowRight, get, noop } from 'lodash';
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

	isWoo() {
		const { authQuery } = this.props;
		return 'woocommerce-onboarding' === authQuery.from;
	}

	getLoginRoute() {
		const emailAddress = this.props.authQuery.userEmail;
		return login( {
			emailAddress,
			isWoo: this.isWoo(),
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
	handleUserCreationError = error => {
		const { errorNotice, translate, warningNotice } = this.props;
		debug( 'Signup error: %o', error );
		this.resetState();
		if ( error && 'user_exists' === error.code ) {
			const text =
				error.data && error.data.email
					? translate(
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
	render() {
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

const connectComponent = connect( null, {
	createAccount: createAccountAction,
	createSocialAccount: createSocialAccountAction,
	errorNotice: errorNoticeAction,
	recordTracksEvent: recordTracksEventAction,
	warningNotice: warningNoticeAction,
} );

export default flowRight( connectComponent, localize )( JetpackSignup );
