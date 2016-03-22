/**
 * External dependencies
 */
import React from 'react';
import store from 'store';

/**
 * Internal dependencies
 */
import ConnectHeader from './connect-header';
import Main from 'components/main';
import { jetpackAuthorize, createAccount } from './authorize-action';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import SignupForm from 'components/signup-form';
import WpcomLoginForm from 'signup/wpcom-login-form';
import _user from 'lib/user';
import config from 'config';

/**
 * Module variables
 */
const userModule = _user();

var LoggedOutForm = React.createClass( {
	displayName: 'LoggedOutForm',

	getInitialState() {
		return { error: false, userData: false, bearerToken: false, isSubmitting: false };
	},

	submitForm( form, userData ) {
		this.setState( { submitting: true } );

		const createAccountCallback = ( error, data ) => {
			if ( error ) {
				this.setState( { submitting: false } );
			} else if ( data.bearer_token ) {
				this.setState( { userData, bearerToken: data.bearer_token } );
			}
		};

		store.set( 'jetpack_connect_authorize_after_signup', '1' );

		createAccount(
			userData,
			createAccountCallback
		);
	},

	loginUser() {
		const { userData, bearerToken } = this.state;
		const extraFields = { jetpack_calypso_login: '1', _wp_nonce: this.props.queryObject._wp_nonce };
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				extraFields={ extraFields }
				redirectTo={ window.location.href } />
		)
	},

	renderFooterLink() {
		const loginUrl = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href={ loginUrl }>
					{ this.translate( 'Already have an account? Sign in' ) }
				</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	},

	render() {
		return (
			<div>
				<SignupForm
					getRedirectToAfterLoginUrl={ window.location.href }
					disabled={ this.state.isSubmitting }
					submitting={ this.state.isSubmitting }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.translate( 'Sign Up and Connect Jetpack' ) }
					footerLink={ this.renderFooterLink() } />
				{ this.state.userData && this.loginUser() }
			</div>
		);
	}
} );

var LoggedInForm = React.createClass( {
	displayName: 'LoggedInForm',

	getInitialState() {
		return { isSubmitting: false, authorizeError: false, authorizeSuccess: false };
	},

	handleSubmit() {
		const { queryObject } = this.props;
		this.setState( { isSubmitting: true, authorizeError: false } );
		jetpackAuthorize( queryObject, this.handleResponse );
	},

	handleResponse( error ) {
		this.setState( { isSubmitting: false } );
		if ( error ) {
			this.setState( { authorizeError: true } );
			return;
		}
		store.remove( 'jetpack_connect_query' );
		window.location = '/';
	},

	renderErrorMessage() {
		if ( this.state.authorizeError ) {
			return <p>Error connecting. Run `localStorage.setItem( 'debug', 'calypso:jetpack-connect-authorize' );` and try again.</p>;
		}
		return null;
	},

	render() {
		const loginUrl = config( 'login_url' ) + '?jetpack_calypso_login=1&redirect_to=' + encodeURIComponent( window.location.href ) + '&_wp_nonce=' + encodeURIComponent( this.props.queryObject._wp_nonce );
		const logoutUrl = config( 'login_url' ) + '?action=logout&redirect_to=' + encodeURIComponent( window.location.href );

		if ( this.state.authorizeSuccess ) {
			return <p>{ this.translate( 'Jetpack connected!' ) }</p>;
		}

		return (
			<div>
				<p>{ this.translate( 'Connecting as %(user)s', { args: { user: this.props.user.display_name } } ) }</p>
				<button disabled={ this.state.isSubmitting } onClick={ this.handleSubmit } className="button is-primary">
					{ this.translate( 'Approve' ) }
				</button>
				{ this.renderErrorMessage() }
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href={ loginUrl }>
						{ this.translate( 'Sign in as a different user' ) }
					</LoggedOutFormLinkItem>
					<LoggedOutFormLinkItem href={ logoutUrl }>
						{ this.translate( 'Create a new account' ) }
					</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
			</div>
		);
	}
} );

export default React.createClass( {
	displayName: 'JetpackConnectAuthorize',

	getInitialState() {
		return ( { user: userModule.get() } );
	},

	renderForm() {
		const { user } = this.state;
		return ( user )
			? <LoggedInForm { ...this.props } user={ user } />
			: <LoggedOutForm { ...this.props } />
	},

	render() {
		const { autoAuthorizing } = this.props;

		if ( autoAuthorizing ) {
			return ( <p>Authorizing...</p> );
		}

		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__site-url-entry-container">
					<ConnectHeader headerText={ this.translate( 'Connect a self-hosted WordPress' ) }
						subHeaderText={ this.translate( 'Jetpack would like to connect to your WordPress.com account' ) }
						step={ 1 }
						steps={ 3 } />
					{ this.renderForm() }
				</div>
			</Main>
		);
	}
} );
