/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gravatar from 'calypso/components/gravatar';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';

/**
 * Style dependencies
 */
import './style.scss';

export function renderInviteAcceptForP2( props ) {
	return (
		<div>
			<div className="invite-accept-logged-in__p2-logo-bar">
				<div className="invite-accept-logged-in__p2-logo">
					<img src="/calypso/images/p2/logo.png" width="67" height="32" alt="P2 logo" />
				</div>
				<div className="invite-accept-logged-in__p2-learn-more">
					<a href="https://wordpress.com/p2" target="_blank" rel="noreferrer">
						{ props.translate( 'Learn more about P2' ) }
					</a>
				</div>
			</div>
			<div className="invite-accept-logged-in__invite-container">
				<div className="invite-accept-logged-in__header">
					<div className="invite-accept-logged-in__site-icon">
						{ props.invite.site.title.charAt( 0 ) }
					</div>
					<div className="invite-accept-logged-in__join-p2-title">
						{ props.translate( 'Join %(siteName)s on P2', {
							args: {
								siteName: props.invite.site.title,
							},
						} ) }
					</div>
					<div className="invite-accept-logged-in__join-p2-text">
						{ props.translate(
							"You've been invited to join %(siteName)s on P2, a platform for teams to share, discuss, and collaborate openly, without interruption.",
							{
								args: {
									siteName: props.invite.site.title,
								},
							}
						) }
					</div>
				</div>

				<div className="invite-accept-logged-in__join-as">
					<Gravatar user={ props.user } size={ 72 } />
					<div className="invite-accept-logged-in__join-as-text">
						{ /* { props.translate( "You'll join as {{usernameWrap}}%(username)s{{/usernameWrap}}", {
							components: {
								usernameWrap: <span className="invite-accept-logged-in__join-as-username" />,
							},
							args: {
								username: props.user && props.user.display_name,
							},
						} ) } */ }
						{ props.joinAsText }
					</div>
					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem onClick={ props.signIn } href={ props.signInLink }>
							{ props.translate( 'Sign in as a different user' ) }
						</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>

				<div className="invite-accept-logged-in__buttons">
					<Button
						primary
						onClick={ props.accept }
						disabled={ props.isSubmitting }
						className={ props.isSubmitting ? 'is-busy' : '' }
					>
						{ ! props.isSubmitting ? props.buttonText : '' }
					</Button>
					<Button onClick={ props.decline } disabled={ props.isSubmitting }>
						{ props.translate( 'Cancel', { context: 'button' } ) }
					</Button>
				</div>
			</div>
		</div>
	);
}
