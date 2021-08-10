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
import { renderInviteAcceptFormHeader } from './invite-accept-form-header';
import { renderInviteAcceptFooter } from './invite-accept-footer';

/**
 * Style dependencies
 */
import './style.scss';

export function renderInviteAcceptForP2( props ) {
	return (
		<div>
			<div className="invite-accept-logged-in__form-container">
				{ renderInviteAcceptFormHeader( { site: props.invite.site, translate: props.translate } ) }
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
			{ renderInviteAcceptFooter( { translate: props.translate } ) }
		</div>
	);
}
