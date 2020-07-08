/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';
import debugModule from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import SignupForm from 'blocks/signup-form';
import InviteFormHeader from 'my-sites/invites/invite-form-header';
import { login } from 'lib/paths';
import { createAccount, acceptInvite } from 'lib/invites/actions';
import WpcomLoginForm from 'signup/wpcom-login-form';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { errorNotice } from 'state/notices/actions';
import { Card } from '@automattic/components';
import FormButton from 'components/forms/form-button';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:invite-accept:logged-out' );

class InviteAcceptLoggedOut extends React.Component {
	state = { error: false, bearerToken: false, userData: false, submitting: false };

	submitButtonText = () => {
		let text = '';
		if ( 'follower' === this.props.invite.role ) {
			text = this.props.translate( 'Sign Up & Follow' );
		} else if ( 'viewer' === this.props.invite.role ) {
			text = this.props.translate( 'Sign Up & View' );
		} else {
			text = this.props.translate( 'Sign Up & Join' );
		}
		return text;
	};

	clickSignInLink = () => {
		const signInLink = login( { redirectTo: window.location.href } );
		recordTracksEvent( 'calypso_invite_accept_logged_out_sign_in_link_click' );
		window.location = signInLink;
	};

	submitForm = ( form, userData ) => {
		const { invite } = this.props;

		this.setState( { submitting: true } );
		debug( 'Storing invite_accepted: ' + JSON.stringify( invite ) );
		store.set( 'invite_accepted', invite );
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

		const enhancedUserData = { ...userData };

		if ( get( invite, 'site.is_wpforteams_site', false ) ) {
			enhancedUserData.signup_flow_name = 'wp-for-teams';
		}

		this.props.createAccount( enhancedUserData, invite, createAccountCallback );
	};

	renderFormHeader = () => {
		return <InviteFormHeader { ...this.props.invite } />;
	};

	loginUser = () => {
		const { userData, bearerToken } = this.state;
		return (
			<WpcomLoginForm
				log={ userData.username }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ window.location.href }
			/>
		);
	};

	subscribeUserByEmailOnly = () => {
		const { invite } = this.props;
		this.setState( { submitting: true } );
		this.props.acceptInvite( invite, ( error ) => {
			if ( error ) {
				this.setState( { error } );
			} else {
				window.location =
					'https://subscribe.wordpress.com?update=activate&email=' +
					encodeURIComponent( invite.sentTo ) +
					'&key=' +
					invite.authKey;
			}
		} );
		recordTracksEvent( 'calypso_invite_accept_logged_out_follow_by_email_click' );
	};

	renderFooterLink = () => {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ this.clickSignInLink }>
					{ this.props.translate( 'Already have a WordPress.com account? Log in now.' ) }
				</LoggedOutFormLinkItem>
				{ this.renderEmailOnlySubscriptionLink() }
			</LoggedOutFormLinks>
		);
	};

	renderEmailOnlySubscriptionLink = () => {
		if ( this.props.invite.role !== 'follower' || ! this.props.invite.activationKey ) {
			return null;
		}

		return (
			<LoggedOutFormLinkItem onClick={ this.subscribeUserByEmailOnly }>
				{ this.props.translate( 'Follow by email subscription only.' ) }
			</LoggedOutFormLinkItem>
		);
	};

	renderSignInLinkOnly = () => {
		// TODO: this needs a refactor to unify it with components/logged-out-form as it's using
		// styles from there but not the component

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="sign-up-form">
				<Card className="logged-out-form">
					{ this.renderFormHeader() }
					<Card className="logged-out-form__footer">
						<FormButton className="signup-form__submit" onClick={ this.clickSignInLink }>
							{ this.props.translate( 'Sign In' ) }
						</FormButton>
					</Card>
				</Card>
			</div>
			/* eslint-enable */
		);
	};

	render() {
		if ( this.props.forceMatchingEmail && this.props.invite.knownUser ) {
			return this.renderSignInLinkOnly();
		}

		return (
			<div>
				<SignupForm
					redirectToAfterLoginUrl={ window.location.href }
					disabled={ this.state.submitting }
					formHeader={ this.renderFormHeader() }
					submitting={ this.state.submitting }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					footerLink={ this.renderFooterLink() }
					email={ this.props.invite.sentTo }
					suggestedUsername=""
					disableEmailInput={ this.props.forceMatchingEmail }
					disableEmailExplanation={ this.props.translate(
						'This invite is only valid for %(email)s.',
						{
							args: { email: this.props.invite.sentTo },
						}
					) }
				/>
				{ this.state.userData && this.loginUser() }
			</div>
		);
	}
}

export default connect( null, ( dispatch ) =>
	bindActionCreators( { createAccount, acceptInvite, errorNotice }, dispatch )
)( localize( InviteAcceptLoggedOut ) );
