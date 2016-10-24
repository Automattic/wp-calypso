/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import SignupForm from 'components/signup-form';
import InviteFormHeader from 'my-sites/invites/invite-form-header';
import { createAccount, acceptInvite } from 'lib/invites/actions';
import WpcomLoginForm from 'signup/wpcom-login-form';
import config from 'config';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import analytics from 'lib/analytics';
import { errorNotice } from 'state/notices/actions';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:invite-accept:logged-out' );

let InviteAcceptLoggedOut = React.createClass( {

	getInitialState() {
		return { error: false, bearerToken: false, userData: false, submitting: false };
	},

	submitButtonText() {
		let text = '';
		if ( 'follower' === this.props.invite.role ) {
			text = this.translate( 'Sign Up & Follow' );
		} else if ( 'viewer' === this.props.invite.role ) {
			text = this.translate( 'Sign Up & View' );
		} else {
			text = this.translate( 'Sign Up & Join' );
		}
		return text;
	},

	clickSignInLink() {
		let signInLink = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );
		analytics.tracks.recordEvent( 'calypso_invite_accept_logged_out_sign_in_link_click' );
		window.location = signInLink;
	},

	submitForm( form, userData ) {
		this.setState( { submitting: true } );
		debug( 'Storing invite_accepted: ' + JSON.stringify( this.props.invite ) );
		store.set( 'invite_accepted', this.props.invite );

		const createAccountCallback = ( error, bearerToken ) => {
			debug( 'Create account error: ' + JSON.stringify( error ) );
			debug( 'Create account bearerToken: ' + bearerToken );

			if ( error ) {
				store.remove( 'invite_accepted' );
				this.setState( { submitting: false } );
			} else if ( bearerToken ) {
				this.setState( { bearerToken, userData } );
			}
		};

		this.props.createAccount(
			userData,
			this.props.invite,
			createAccountCallback
		);
	},

	renderFormHeader() {
		return (
			<InviteFormHeader { ...this.props.invite } />
		);
	},

	loginUser() {
		const { userData, bearerToken } = this.state;
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ window.location.href } />
		);
	},

	subscribeUserByEmailOnly() {
		const { invite } = this.props;
		this.setState( { submitting: true } );
		this.props.acceptInvite(
			invite,
			( error ) => {
				if ( error ) {
					this.setState( { error } );
				} else {
					window.location = 'https://subscribe.wordpress.com?update=activate&email=' + encodeURIComponent( invite.sentTo ) + '&key=' + invite.authKey;
				}
			}
		);
		analytics.tracks.recordEvent( 'calypso_invite_accept_logged_out_follow_by_email_click' );
	},

	renderFooterLink() {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ this.clickSignInLink }>
					{ this.translate( 'Already have a WordPress.com account? Log in now.' ) }
				</LoggedOutFormLinkItem>
				{ this.renderEmailOnlySubscriptionLink() }
			</LoggedOutFormLinks>
		);
	},

	renderEmailOnlySubscriptionLink() {
		if ( this.props.invite.role !== 'follower' || ! this.props.invite.activationKey ) {
			return null;
		}

		return (
			<LoggedOutFormLinkItem onClick={ this.subscribeUserByEmailOnly }>
				{ this.translate( 'Follow by email subscription only.' ) }
			</LoggedOutFormLinkItem>
		);
	},

	renderSignInLinkOnly() {
		return (
			<div className="sign-up-form">
				<Card className="logged-out-form">
					{ this.renderFormHeader() }
					<Card className="logged-out-form__footer">
						<FormButton className="signup-form__submit" onClick={ this.clickSignInLink }>
							{ this.translate( 'Sign In' ) }
						</FormButton>
					</Card>
				</Card>
			</div>
		);
	},

	render() {
		if ( this.props.forceMatchingEmail && this.props.invite.knownUser ) {
			return this.renderSignInLinkOnly();
		}

		return (
			<div>
				<SignupForm
					getRedirectToAfterLoginUrl={ window.location.href }
					disabled={ this.state.submitting }
					formHeader={ this.renderFormHeader() }
					submitting={ this.state.submitting }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					footerLink={ this.renderFooterLink() }
					email={ this.props.invite.sentTo }
					disableEmailInput={ this.props.forceMatchingEmail }
					disableEmailExplanation={ this.translate( 'This invite is only valid for %(email)s.', { args: { email: this.props.invite.sentTo } } ) } />
				{ this.state.userData && this.loginUser() }
			</div>
		);
	}

} );

export default connect(
	null,
	dispatch => bindActionCreators( { createAccount, acceptInvite, errorNotice }, dispatch )
)( InviteAcceptLoggedOut );
