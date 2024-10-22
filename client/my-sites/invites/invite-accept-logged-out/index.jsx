import { Card } from '@automattic/components';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import store from 'store';
import SignupForm from 'calypso/blocks/signup-form';
import FormButton from 'calypso/components/forms/form-button';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import InviteFormHeader from 'calypso/my-sites/invites/invite-form-header';
import P2InviteAcceptLoggedOut from 'calypso/my-sites/invites/p2/invite-accept-logged-out';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { createAccount, acceptInvite } from 'calypso/state/invites/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { WpLoggedOutInviteLogo } from '../invite-accept-logged-out/wp-logo';

import './style.scss';
/**
 * Module variables
 */
const debug = debugModule( 'calypso:invite-accept:logged-out' );
const noop = () => {};

class InviteAcceptLoggedOut extends Component {
	state = { bearerToken: false, userData: false, submitting: false };

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
		const linkParams = { redirectTo: window.location.href };
		if ( get( this.props.invite, 'site.is_wpforteams_site', false ) ) {
			linkParams.from = 'p2';
		}

		const signInLink = login( linkParams );
		recordTracksEvent( 'calypso_invite_accept_logged_out_sign_in_link_click' );
		window.location = signInLink;
	};

	submitForm = ( form, userData, _, afterSubmitCallback = noop ) => {
		const { invite } = this.props;
		recordTracksEvent( 'calypso_invite_accept_logged_out_submit', {
			role: invite?.role,
			site_id: invite?.site?.ID,
		} );

		this.setState( { submitting: true } );
		debug( 'Storing invite_accepted: ' + JSON.stringify( invite ) );
		store.set( 'invite_accepted', invite );

		const enhancedUserData = { ...userData };

		if ( get( invite, 'site.is_wpforteams_site', false ) ) {
			enhancedUserData.signup_flow_name = 'p2';
		}

		this.props
			.createAccount( enhancedUserData, invite )
			.then( ( response ) => {
				const bearerToken = response.bearer_token;
				debug( 'Create account bearerToken: ' + bearerToken );
				this.setState( { bearerToken, userData } );
			} )
			.catch( ( error ) => {
				debug( 'Create account error: ' + JSON.stringify( error ) );
				store.remove( 'invite_accepted' );
				this.setState( { submitting: false } );
			} )
			.finally( afterSubmitCallback );
	};

	renderFormHeader = () => {
		return <InviteFormHeader { ...this.props.invite } />;
	};

	loginUser = () => {
		const { userData, bearerToken } = this.state;
		return (
			<WpcomLoginForm
				// in case the user signs up without a username, login for the first time using their email address
				// users without a username are assigned one in the backend. But at this point, the client side don't have this generated username in memory yet
				// so we failover to the email
				log={ userData.username || userData.email }
				authorization={ 'Bearer ' + bearerToken }
				redirectTo={ window.location.href }
			/>
		);
	};

	subscribeUserByEmailOnly = () => {
		const { invite } = this.props;
		this.setState( { submitting: true } );
		this.props
			.acceptInvite( invite, this.props.emailVerificationSecret )
			.then( () => {
				window.location = addQueryArgs(
					{ update: 'activate', email: invite.sentTo, key: invite.authKey },
					'https://subscribe.wordpress.com'
				);
			} )
			.catch( () => this.setState( { submitting: false } ) );
		recordTracksEvent( 'calypso_invite_accept_logged_out_follow_by_email_click' );
	};

	renderFooterLink = () => {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ this.clickSignInLink }>
					{ this.props.translate( 'Already have a WordPress.com account?' ) }
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
				<div className="logged-out-form">
					{ this.renderFormHeader() }
					<Card className="logged-out-form__footer">
						<FormButton className="signup-form__submit" onClick={ this.clickSignInLink }>
							{ this.props.translate( 'Sign In' ) }
						</FormButton>
					</Card>
				</div>
			</div>
			/* eslint-enable */
		);
	};

	render() {
		if ( this.props.forceMatchingEmail && this.props.invite.knownUser ) {
			return this.renderSignInLinkOnly();
		}

		if ( get( this.props.invite, 'site.is_wpforteams_site', false ) ) {
			return P2InviteAcceptLoggedOut( {
				...this.props,
				onClickSignInLink: this.clickSignInLink,
				isSubmitting: this.state.submitting,
				save: this.save,
				submitForm: this.submitForm,
				userData: this.state.userData,
				loginUser: this.loginUser,
			} );
		}

		return (
			<>
				<WpLoggedOutInviteLogo />
				<div className="invite-accept-logged-out-wrapper">
					{ this.renderFormHeader() }
					<SignupForm
						redirectToAfterLoginUrl={ window.location.href }
						isPasswordless
						displayUsernameInput={ false }
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
						submitButtonLabel={ this.props.translate( 'Create an account' ) }
						labelText={ this.props.translate( 'Your email address' ) }
					/>
					{ this.state.userData && this.loginUser() }
				</div>
			</>
		);
	}
}

export default connect(
	( state ) => ( {
		emailVerificationSecret: getCurrentQueryArguments( state )?.email_verification_secret,
	} ),
	{ createAccount, acceptInvite }
)( localize( InviteAcceptLoggedOut ) );
