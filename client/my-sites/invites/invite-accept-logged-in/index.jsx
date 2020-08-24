/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import page from 'page';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import Gravatar from 'components/gravatar';
import InviteFormHeader from 'my-sites/invites/invite-form-header';
import { acceptInvite } from 'lib/invites/actions';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { recordTracksEvent } from 'lib/analytics/tracks';

/**
 * Style dependencies
 */
import './style.scss';

class InviteAcceptLoggedIn extends React.Component {
	state = { submitting: false };

	accept = () => {
		this.setState( { submitting: true } );
		this.props.acceptInvite( this.props.invite, ( error ) => {
			if ( error ) {
				this.setState( { submitting: false } );
			} else if ( get( this.props, 'invite.site.is_vip' ) ) {
				window.location.href = this.props.redirectTo;
			} else {
				page( this.props.redirectTo );
			}
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
				<InviteFormHeader { ...this.props.invite } user={ this.props.user } matchEmailError />
				<div className="invite-accept-logged-in__button-bar">
					<Button onClick={ this.signInLink } href={ this.props.signInLink }>
						{ this.props.invite.knownUser
							? this.props.translate( 'Sign In as %(email)s', {
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
			<div className={ classNames( 'invite-accept-logged-in', this.props.className ) }>
				{ this.props.forceMatchingEmail ? this.renderMatchEmailError() : this.renderAccept() }
			</div>
		);
	}
}

export default connect( null, ( dispatch ) => bindActionCreators( { acceptInvite }, dispatch ) )(
	localize( InviteAcceptLoggedIn )
);
