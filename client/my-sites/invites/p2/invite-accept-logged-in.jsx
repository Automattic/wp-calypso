/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gravatar from 'calypso/components/gravatar';
import InviteFormHeader from 'calypso/my-sites/invites/invite-form-header';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';

/**
 * Style dependencies
 */
import './style.scss';

export function renderInviteAcceptForP2( props ) {
	return (
		<div>
			<div className="invite-accept-logged-in__p2-logo">
				<img src="/calypso/images/p2/logo.png" width="67" height="32" alt="P2 logo" />
			</div>

			<div className="invite-accept-logged-in__card">
				<InviteFormHeader { ...props.invite } user={ props.user } />
				<div className="invite-accept-logged-in__join-as">
					<Gravatar user={ props.user } size={ 72 } />
					<div className="invite-accept-logged-in__join-as-text-container">
						{ props.joinAsText }
						<LoggedOutFormLinks>
							<LoggedOutFormLinkItem onClick={ props.signIn } href={ props.signInLink }>
								{ props.translate( 'Sign in as a different user' ) }
							</LoggedOutFormLinkItem>
						</LoggedOutFormLinks>
					</div>
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
