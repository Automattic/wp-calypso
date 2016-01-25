/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import page from 'page';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import config from 'config';
import InviteFormHeader from 'my-sites/invites/invite-form-header';
import { acceptInvite } from 'lib/invites/actions';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import analytics from 'analytics';

let InviteAcceptLoggedIn = React.createClass( {

	getInitialState() {
		return { submitting: false }
	},

	accept() {
		this.setState( { submitting: true } );
		this.props.acceptInvite( this.props.invite, error => {
			if ( ! error ) {
				page( this.props.redirectTo );
			} else {
				this.setState( { submitting: false } );
			}
		} );
		analytics.tracks.recordEvent( 'calypso_invite_accept_logged_in_join_button_click' );
	},

	decline() {
		if ( this.props.decline && 'function' === typeof this.props.decline ) {
			this.props.decline();
			analytics.tracks.recordEvent( 'calypso_invite_accept_logged_in_decline_button_click' );
		}
	},

	signInLink() {
		analytics.tracks.recordEvent( 'calypso_invite_accept_logged_in_sign_in_link_click' );
	},

	getButtonText() {
		let text = '';
		if ( 'follower' === this.props.invite.role ) {
			text = this.state.submitting
				? this.translate( 'Following…', { context: 'button' } )
				: this.translate( 'Follow', { context: 'button' } );
		} else {
			text = this.state.submitting
				? this.translate( 'Joining…', { context: 'button' } )
				: this.translate( 'Join', { context: 'button' } );
		}

		return text;
	},

	getJoinAsText() {
		const { user } = this.props;
		let text = '';

		if ( 'follower' === this.props.invite.role ) {
			text = this.translate( 'Follow as {{usernameWrap}}%(username)s{{/usernameWrap}}', {
				components: {
					usernameWrap: <span className="invite-accept-logged-in__join-as-username" />
				},
				args: {
					username: user && user.display_name
				}
			} );
		} else {
			text = this.translate( 'Join as {{usernameWrap}}%(username)s{{/usernameWrap}}', {
				components: {
					usernameWrap: <span className="invite-accept-logged-in__join-as-username" />
				},
				args: {
					username: user && user.display_name
				}
			} );
		}

		return text;
	},

	render() {
		const { user } = this.props,
			signInLink = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );

		return (
			<div className={ classNames( 'invite-accept-logged-in', this.props.className ) }>
				<Card>
					<InviteFormHeader { ... this.props.invite } />
					<div className="invite-accept-logged-in__join-as">
						<Gravatar user={ user } size={ 72 } />
						{ this.getJoinAsText() }
					</div>
					<div className="invite-accept-logged-in__button-bar">
						<Button onClick={ this.decline } disabled={ this.state.submitting }>
							{ this.translate( 'Decline', { context: 'button' } ) }
						</Button>
						<Button primary onClick={ this.accept } disabled={ this.state.submitting }>
							{ this.getButtonText() }
						</Button>
					</div>
				</Card>

				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem onClick={ this.signInLink } href={ signInLink }>
						{ this.translate( 'Sign in as a different user' ) }
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { acceptInvite }, dispatch )
)( InviteAcceptLoggedIn );
