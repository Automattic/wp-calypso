/** @format */
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
import AuthFormHeader from './auth-form-header';
import config from 'config';
import HelpButton from './help-button';
import LocaleSuggestions from 'components/locale-suggestions';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import { createAccount as createAccountAction } from 'state/jetpack-connect/actions';
import { getAuthorizationData } from 'state/jetpack-connect/selectors';
import { login } from 'lib/paths';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:jetpack-connect:authorize-form' );

class LoggedOutForm extends Component {
	static propTypes = {
		authQuery: PropTypes.object.isRequired,
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

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_signup_view' );
	}

	getRedirectAfterLoginUrl() {
		return window.location.href;
	}

	handleSubmitSignup = ( form, userData ) => {
		debug( 'submiting new account', form, userData );
		this.props.createAccount( userData );
	};

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	renderLoginUser() {
		const { userData, bearerToken } = this.props.authorizationData;

		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				emailAddress={ this.props.authQuery.userEmail }
				redirectTo={ this.getRedirectAfterLoginUrl() }
			/>
		);
	}

	renderLocaleSuggestions() {
		return this.props.locale ? (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		) : null;
	}

	renderFooterLink() {
		const redirectTo = this.getRedirectAfterLoginUrl();
		const emailAddress = this.props.authQuery.userEmail;

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem
					href={ login( {
						isNative: config.isEnabled( 'login/native-login-links' ),
						redirectTo,
						emailAddress,
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
			<div>
				{ this.renderLocaleSuggestions() }
				<AuthFormHeader authQuery={ this.props.authQuery } />
				<SignupForm
					redirectToAfterLoginUrl={ this.getRedirectAfterLoginUrl() }
					disabled={ isAuthorizing }
					submitting={ isAuthorizing }
					submitForm={ this.handleSubmitSignup }
					submitButtonText={ this.props.translate( 'Sign Up and Connect Jetpack' ) }
					footerLink={ this.renderFooterLink() }
					email={ this.props.authQuery.userEmail }
					suggestedUsername={ get( userData, 'username', '' ) }
				/>
				{ userData && this.renderLoginUser() }
			</div>
		);
	}
}

export { LoggedOutForm as LoggedOutFormTestComponent };

export default connect(
	state => ( {
		authorizationData: getAuthorizationData( state ),
	} ),
	{
		recordTracksEvent: recordTracksEventAction,
		createAccount: createAccountAction,
	}
)( localize( LoggedOutForm ) );
