import { Card, Button } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import InviteFormHeader from 'calypso/my-sites/invites/invite-form-header';
import P2InviteAcceptLoggedIn from 'calypso/my-sites/invites/p2/invite-accept-logged-in';
import { acceptInvite } from 'calypso/state/invites/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import './style.scss';

class InviteAcceptLoggedIn extends Component {
	state = { submitting: false };

	accept = () => {
		this.setState( { submitting: true } );
		this.props
			.acceptInvite( this.props.invite, this.props.emailVerificationSecret )
			.then( () => {
				navigate( this.props.redirectTo );
			} )
			.catch( () => {
				this.setState( { submitting: false } );
			} );
		recordTracksEvent( 'calypso_invite_accept_logged_in_join_button_click' );
	};

	decline = () => {
		if ( this.props.decline && 'function' === typeof this.props.decline ) {
			this.props.decline();
			recordTracksEvent( 'calypso_invite_accept_logged_in_decline_button_click' );
		}
	};

	signInLink = () => {
		recordTracksEvent( 'calypso_invite_accept_logged_in_sign_in_link_click' );
	};

	getButtonText = () => {
		let text = '';
		if ( 'follower' === this.props.invite.role ) {
			text = this.state.submitting
				? this.props.translate( 'Following…', { context: 'button' } )
				: this.props.translate( 'Follow', { context: 'button' } );
		} else {
			text = this.state.submitting
				? this.props.translate( 'Joining…', { context: 'button' } )
				: this.props.translate( 'Join', { context: 'button' } );
		}

		return text;
	};

	getJoinAsText = () => {
		const { user } = this.props;
		let text = '';

		if ( 'follower' === this.props.invite.role ) {
			text = this.props.translate( 'Follow as {{usernameWrap}}%(username)s{{/usernameWrap}}', {
				components: {
					usernameWrap: <span className="invite-accept-logged-in__join-as-username" />,
				},
				args: {
					username: user && user.display_name,
				},
			} );
		} else {
			text = this.props.translate( 'Join as {{usernameWrap}}%(username)s{{/usernameWrap}}', {
				components: {
					usernameWrap: <span className="invite-accept-logged-in__join-as-username" />,
				},
				args: {
					username: user && user.display_name,
				},
			} );
		}

		return text;
	};

	renderMatchEmailError = () => {
		return (
			<Card>
				<InviteFormHeader { ...this.props.invite } user={ this.props.user } />
				<div className="invite-accept-logged-in__button-bar">
					<Button onClick={ this.signInLink } href={ this.props.signInLink }>
						{ this.props.invite.knownUser
							? this.props.translate( 'Sign in as %(email)s', {
									context: 'button',
									args: { email: this.props.invite.sentTo },
							  } )
							: this.props.translate( 'Register as %(email)s', {
									context: 'button',
									args: { email: this.props.invite.sentTo },
							  } ) }
					</Button>
				</div>
			</Card>
		);
	};

	renderAccept = () => {
		if ( this.props.invite?.site?.is_wpforteams_site ) {
			return P2InviteAcceptLoggedIn( {
				...this.props,
				accept: this.accept,
				decline: this.decline,
				signIn: this.signInLink,
				isSubmitting: this.state.submitting,
				joinAsText: this.getJoinAsText(),
				buttonText: this.getButtonText(),
			} );
		}

		return (
			<div>
				<Card>
					<InviteFormHeader { ...this.props.invite } user={ this.props.user } />
					<div className="invite-accept-logged-in__join-as">
						<Gravatar user={ this.props.user } size={ 72 } />
						{ this.getJoinAsText() }
					</div>
					<div className="invite-accept-logged-in__button-bar">
						<Button onClick={ this.decline } disabled={ this.state.submitting }>
							{ this.props.translate( 'Cancel', { context: 'button' } ) }
						</Button>
						<Button primary onClick={ this.accept } disabled={ this.state.submitting }>
							{ this.getButtonText() }
						</Button>
					</div>
				</Card>

				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem onClick={ this.signInLink } href={ this.props.signInLink }>
						{ this.props.translate( 'Sign in as a different user' ) }
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</div>
		);
	};

	render() {
		return (
			<div className={ clsx( 'invite-accept-logged-in', this.props.className ) }>
				{ this.props.forceMatchingEmail ? this.renderMatchEmailError() : this.renderAccept() }
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		emailVerificationSecret: getCurrentQueryArguments( state )?.email_verification_secret,
	} ),
	{ acceptInvite }
)( localize( InviteAcceptLoggedIn ) );
