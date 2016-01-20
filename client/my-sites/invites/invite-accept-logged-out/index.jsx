/**
 * External dependencies
 */
import React from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import SignupForm from 'components/signup-form'
import InviteFormHeader from 'my-sites/invites/invite-form-header'
import { createAccount, acceptInvite } from 'lib/invites/actions'
import WpcomLoginForm from 'signup/wpcom-login-form'
import config from 'config'
import wpcom from 'lib/wp'
import store from 'store'
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import analytics from 'analytics';
import { errorNotice } from 'state/notices/actions';

let InviteAcceptLoggedOut = React.createClass( {

	displayName: 'InviteAcceptLoggedOut',

	getInitialState() {
		return { error: false, bearerToken: false, userData: false, submitting: false };
	},

	submitButtonText() {
		let text = '';
		if ( 'follower' === this.props.role ) {
			text = this.translate( 'Sign Up & Follow' );
		} else if ( 'viewer' === this.props.role ) {
			text = this.translate( 'Sign Up & View' );
		} else {
			text = this.translate( 'Sign Up & Join' );
		}
		return text;
	},

	clickSignInLink() {
		analytics.tracks.recordEvent( 'calypso_invite_accept_logged_out_sign_in_link_click' );
	},

	submitForm( form, userData ) {
		this.setState( { submitting: true } );
		createAccount(
			userData,
			( error, bearerToken ) => {
				if ( bearerToken ) {
					wpcom.loadToken( bearerToken );
					wpcom.undocumented().acceptInvite(
						this.props,
						( acceptError ) => {
							if ( acceptError ) {
								this.setState( { submitting: false } )
								this.setState( { submitting: false } )
								if ( acceptError.message ) {
									this.props.errorNotice( acceptError.message );
								} else {
									this.props.errorNotice( this.translate( 'There was an error accepting your invitation. Please try again.' ) )
								}
							} else {
								store.set( 'invite_accepted', this.props );
								this.setState( { userData, bearerToken } );
							}
						}
					);
				}
			}
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
				redirectTo={ window.location.href } />
		)
	},

	subscribeUserByEmailOnly() {
		this.setState( { submitting: true } );
		acceptInvite(
			this.props,
			( error ) => {
				if ( error ) {
					this.setState( { submitting: false } );
					if ( error.message ) {
						this.props.errorNotice( error.message );
					} else {
						this.props.errorNotice( this.translate( 'There was an error accepting your invitation. Please try again.' ) )
					}
				} else {
					window.location = 'https://subscribe.wordpress.com?update=activate&email=' + encodeURIComponent( this.props.sentTo ) + '&key=' + this.props.authKey;
				}
			}
		);
		analytics.tracks.recordEvent( 'calypso_invite_accept_logged_out_follow_by_email_click' );
	},

	renderFooterLink() {
		let logInUrl = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ this.clickSignInLink } href={ logInUrl }>
					{ this.translate( 'Already have a WordPress.com account? Log in now.' ) }
				</LoggedOutFormLinkItem>
				{ this.renderEmailOnlySubscriptionLink() }
			</LoggedOutFormLinks>
		);
	},

	renderEmailOnlySubscriptionLink() {
		if ( this.props.role !== 'follower' || ! this.props.activationKey ) {
			return null;
		}

		return (
			<LoggedOutFormLinkItem onClick={ this.subscribeUserByEmailOnly }>
				{ this.translate( 'Follow by email subscription only.' ) }
			</LoggedOutFormLinkItem>
		);
	},

	render() {
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
					email={ this.props.sentTo } />
				{ this.state.userData && this.loginUser() }
			</div>
		)
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { errorNotice }, dispatch )
)( InviteAcceptLoggedOut );

