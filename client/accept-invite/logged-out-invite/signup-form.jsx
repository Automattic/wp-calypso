/**
 * External dependencies
 */
import React from 'react'
import { get } from 'lodash'

/**
 * Internal dependencies
 */
import SignupForm from 'components/signup-form'
import InviteFormHeader from '../invite-form-header'
import { createAccount, acceptInvite } from '../actions'
import WpcomLoginForm from 'signup/wpcom-login-form'
import config from 'config'

export default React.createClass( {

	displayName: 'LoggedOutInviteSignupForm',

	getInitialState() {
		return { error: false, bearerToken: false, userData: false, submitting: false };
	},

	getRedirectToAfterLoginUrl() {
		return '/accept-invite';
	},

	submitButtonText() {
		return this.translate( 'Sign Up & Join' );
	},

	submitForm( form, userData ) {
		this.setState( { submitting: true } );
		createAccount(
			userData,
			( error, bearerToken ) =>
				bearerToken &&
				acceptInvite(
					this.props.invite,
					bearerToken,
					( acceptInviteError ) => this.setState( { acceptInviteError, userData, bearerToken } )
				)
		);
	},

	getFormHeader() {
		return (
			<InviteFormHeader { ...this.props } />
		);
	},

	getRedirectTo() {
		const { invite } = this.props;
		let redirectTo = window.location.origin;
		switch ( invite.meta.role ) {
			case 'viewer':
			case 'follower':
				break;
			default:
				redirectTo += '/posts/' + invite.blog_id;
		}
		return redirectTo += '?invite_accepted=' + invite.blog_id;
	},

	loginUser() {
		const { userData, bearerToken } = this.state;
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ this.getRedirectTo() }
			/>
		)
	},

	footerLink() {
		let logInUrl = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );
		return (
			<a href={ logInUrl } className="logged-out-form__link">
				{ this.translate( 'Already have a WordPress.com account? Log in now.' ) }
			</a>
		);
	},

	render() {
		return (
			<div>
				<SignupForm
					getRedirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl }
					disabled={ this.state.submitting }
					formHeader={ this.getFormHeader() }
					submitting={ this.state.submitting }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					footerLink={ this.footerLink() }
					email={ get( this.props, 'invite.meta.sent_to' ) }
				/>
				{ this.state.userData && this.loginUser() }
			</div>
		)
	}

} );
