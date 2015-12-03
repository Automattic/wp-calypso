/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import config from 'config';
import InviteFormHeader from 'my-sites/invites/invite-form-header';
import { acceptInvite, displayInviteAccepted } from 'lib/invites/actions';

export default React.createClass( {

	displayName: 'InviteAcceptLoggedIn',

	acceptInvite() {
		const { invite } = this.props;
		acceptInvite( invite, () => {
			page( this.props.redirectTo );
			displayInviteAccepted( invite.blog_id );
		} );
	},

	render() {
		const { user } = this.props,
			signInLink = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );

		return (
			<div className={ classNames( 'logged-in-accept', this.props.className ) } >
				<Card>
					<InviteFormHeader { ...this.props } />
					<div className="invite-accept-logged-in__join-as">
						<Gravatar user={ user } size={ 72 } />
						{
							this.translate( 'Join as {{usernameWrap}}%(username)s{{/usernameWrap}}', {
								components: {
									usernameWrap: <span className="invite-accept-logged-in__join-as-username" />
								},
								args: {
									username: user && user.display_name
								}
							} )
						}
					</div>
					<div className="invite-accept-logged-in__button-bar">
						<Button onClick={ this.props.decline }>
							{ this.translate( 'Decline', { context: 'button' } ) }
						</Button>
						<Button primary onClick={ this.acceptInvite }>
							{ this.translate( 'Join', { context: 'button' } ) }
						</Button>
					</div>
				</Card>
				<a className="logged-in-accept__sign-in" href={ signInLink }>
					{ this.translate( 'Sign in as a different user' ) }
				</a>
			</div>
		);
	}
} );
