/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import config from 'config';
import userModule from 'lib/user';
import InviteFormHeader from '../invite-form-header';

const user = userModule();

export default React.createClass( {

	displayName: 'LoggedInAccept',

	getInviteRole() {
		return get( this.props, 'invite.meta.role', '' );
	},

	render() {
		let userObject = user.get(),
			signInLink = config( 'login_url' ) + '?redirect_to=' + encodeURIComponent( window.location.href );

		return (
			<div className={ classNames( 'logged-in-accept', this.props.className ) } >
				<Card>
					<InviteFormHeader
						title={
							this.translate( 'Would you like to become an %(siteRole)s on {{siteNameLink}}%(siteName)s{{/siteNameLink}}?', {
								args: {
									siteName: get( this.props, 'blog_details.title', '' ),
									siteRole: this.getInviteRole()
								},
								components: {
									siteNameLink: <a href={ get( this.props, 'blog_details.domain', null ) } className="logged-in-accept__site-name" />
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
					<div className="logged-in-accept__join-as">
						<Gravatar user={ userObject } size="72"/>
						{
							this.translate( 'Join as {{usernameWrap}}%(username)s{{/usernameWrap}}', {
								components: {
									usernameWrap: <span className="logged-in-accept__join-as-username" />
								},
								args: {
									username: userObject && userObject.display_name
								}
							} )
						}
					</div>
					<div className="logged-in-accept__button-bar">
						<Button>
							{ this.translate( 'Decline', { context: 'button' } ) }
						</Button>
						<Button primary>
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
