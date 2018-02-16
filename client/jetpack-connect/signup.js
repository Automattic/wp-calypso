/** @format */
/**
 * Handle log in and sign up as part of the Jetpack Connect flow
 *
 * For user creation, this component relies on redux to store state as a user is created via a
 * series of actions. Eventually this results in updating the `authorizationData.userData` prop on
 * this component.
 *
 * When this component receives `userData`, it renders a `<WpcomLoginForm />` with the userData,
 * which handles logging in the new user and redirection.
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import AuthFormHeader from './auth-form-header';
import config from 'config';
import HelpButton from './help-button';
import LocaleSuggestions from 'components/locale-suggestions';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import MainWrapper from './main-wrapper';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import { authQueryPropTypes } from './utils';
import { createAccount as createAccountAction } from 'state/jetpack-connect/actions';
import { getAuthorizationData } from 'state/jetpack-connect/selectors';
import { login } from 'lib/paths';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:jetpack-connect:authorize-form' );

export class JetpackSignup extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,
		locale: PropTypes.string,
		path: PropTypes.string,

		// Connected props
		authorizationData: PropTypes.shape( {
			bearerToken: PropTypes.string,
			isAuthorizing: PropTypes.bool,
			userData: PropTypes.object,
		} ).isRequired,
		createAccount: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentWillMount() {
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

	handleSubmitSignup = ( form, userData ) => {
		debug( 'submiting new account', form, userData );
		this.props.createAccount( userData );
	};

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	/**
	 * Log in the new user
	 *
	 * After an account is created, `authorizationData.userData` is populated
	 * and we render this component to log the new user in.
	 *
	 * @return {Object} React element for render.
	 */
	renderLoginUser() {
		const { userData, bearerToken } = this.props.authorizationData;

		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				emailAddress={ this.props.authQuery.userEmail }
				redirectTo={ addQueryArgs( { auth_approved: true }, window.location.href ) }
			/>
		);
	}

	renderLocaleSuggestions() {
		return this.props.locale ? (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		) : null;
	}

	renderFooterLink() {
		const emailAddress = this.props.authQuery.userEmail;

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem
					href={ login( {
						emailAddress,
						isJetpack: true,
						isNative: config.isEnabled( 'login/native-login-links' ),
						locale: this.props.locale,
						redirectTo: window.location.href,
					} ) }
				>
					{ this.props.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>
				<HelpButton onClick={ this.handleClickHelp } />
			</LoggedOutFormLinks>
		);
	}

	render() {
		const { isAuthorizing, userData } = this.props.authorizationData;

		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">
					{ this.renderLocaleSuggestions() }
					<AuthFormHeader authQuery={ this.props.authQuery } />
					<SignupForm
						disabled={ isAuthorizing }
						email={ this.props.authQuery.userEmail }
						footerLink={ this.renderFooterLink() }
						locale={ this.props.locale }
						redirectToAfterLoginUrl={ addQueryArgs(
							{ auth_approved: true },
							window.location.href
						) }
						submitButtonText={ this.props.translate( 'Sign Up and Connect Jetpack' ) }
						submitForm={ this.handleSubmitSignup }
						submitting={ isAuthorizing }
						suggestedUsername={ get( userData, 'username', '' ) }
					/>
					{ userData && this.renderLoginUser() }
				</div>
			</MainWrapper>
		);
	}
}

export default connect(
	state => ( {
		authorizationData: getAuthorizationData( state ),
	} ),
	{
		recordTracksEvent: recordTracksEventAction,
		createAccount: createAccountAction,
	}
)( localize( JetpackSignup ) );
