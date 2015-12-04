/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import SignupForm from 'components/signup-form'
import InviteFormHeader from 'my-sites/invites/invite-form-header'
import { createAccount, acceptInvite } from 'lib/invites/actions'
import WpcomLoginForm from 'signup/wpcom-login-form'
import config from 'config'

export default React.createClass( {

	displayName: 'InviteAcceptLoggedOut',

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
					this.props,
					( acceptInviteError ) => this.setState( { acceptInviteError, userData, bearerToken } ),
					bearerToken
				)
		);
	},

	renderFormHeader() {
		return (
			<InviteFormHeader { ...this.props } />
		);
	},

	loginUser() {
		const { userData, bearerToken } = this.state;
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ window.location.origin + this.props.redirectTo + '?invite_accepted=' + this.props.site.ID }
			/>
		)
	},

	subscribeUserByEmailOnly() {
		this.setState( { submitting: true } );
		acceptInvite(
			this.props,
			( error ) => {
				if ( error ) {
					this.setState( { error } );
				} else {
					window.location = 'https://subscribe.wordpress.com?update=activate&email=' + encodeURIComponent( this.props.sent_to ) + '&key=' + this.props.authKey;
				}
			}
		);
	},

	renderFooterLink() {
		let logInUrl = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );
		return (
			<div>
				<a href={ logInUrl } className="logged-out-form__link">
					{ this.translate( 'Already have a WordPress.com account? Log in now.' ) }
				</a>
				{ this.renderEmailOnlySubscriptionLink() }
			</div>
		);
	},

	renderEmailOnlySubscriptionLink() {
		if ( this.props.role !== 'follower' || ! this.props.activationKey ) {
			return null;
		}

		return (
			<a onClick={ this.subscribeUserByEmailOnly } className="logged-out-form__link">
				{ this.translate( 'Follow by email subscription only.' ) }
			</a>
		);
	},

	render() {
		return (
			<div>
				<SignupForm
					getRedirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl }
					disabled={ this.state.submitting }
					formHeader={ this.renderFormHeader() }
					submitting={ this.state.submitting }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					footerLink={ this.renderFooterLink() }
					email={ this.props.sent_to }
				/>
				{ this.state.userData && this.loginUser() }
			</div>
		)
	}

} );
