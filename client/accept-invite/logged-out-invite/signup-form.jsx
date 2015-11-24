/**
 * External dependencies
 */
import React from 'react'

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

	getInviteRole() {
		let meta = this.props.invite && this.props.invite.meta ? this.props.invite.meta : false;
		return meta && meta.role ? meta.role : false;
	},

	getFormHeader() {
		return (
			<InviteFormHeader
				title={
					this.translate( 'Sign up to become an %(siteRole)s on {{siteNameLink}}%(siteName)s{{/siteNameLink}}?', {
						args: {
							siteName: this.props.blog_details.title,
							siteRole: this.getInviteRole()
						},
						components: {
							siteNameLink: <a href={ this.props.blog_details.domain } className="logged-in-accept__site-name" />
						}
					} )
				}
				explanation={
					this.translate(
						'As an %(siteRole)s you will be able to publish and edit your own posts as well as upload media.', {
							args: {
								siteRole: this.getInviteRole()
							}
						}
					)
				}
			/>
		);
	},

	getRedirectTo() {
		const redirectTo = window.location.origin,
			{ invite } = this.props;
		switch ( invite.meta.role ) {
			case 'viewer':
			case 'follower':
				return redirectTo;
				break;
			default:
				return redirectTo + '/posts/' + invite.blog_id;
		}
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
				/>
				{ this.state.userData && this.loginUser() }
			</div>
		)
	}

} );
