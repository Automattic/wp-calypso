/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import store from 'store';
import page from 'page';

/**
 * Internal Dependencies
 */
import i18n from 'lib/mixins/i18n';
import titleActions from 'lib/screen-title/actions';
import InviteAccept from 'my-sites/invites/invite-accept';
import { setSection } from 'state/ui/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getRedirectAfterAccept } from 'my-sites/invites/utils';
import { acceptInvite as acceptInviteAction } from 'lib/invites/actions';
import _user from 'lib/user';

export function acceptInvite( context ) {
	const acceptedInvite = store.get( 'invite_accepted' );
	if ( acceptedInvite ) {
		const userModule = _user();
		if ( userModule.get().email === acceptedInvite.sentTo ) {
			userModule.set( { email_verified: true } );
		}
		store.remove( 'invite_accepted' );
		const acceptInviteCallback = error => {
			if ( error ) {
				page( window.location.href );
			} else {
				page( getRedirectAfterAccept( acceptedInvite ) );
			}
		}
		acceptInviteAction( acceptedInvite, acceptInviteCallback )( context.store.dispatch );
		return;
	}

	titleActions.setTitle( i18n.translate( 'Accept Invite', { textOnly: true } ) );

	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore(
		React.createElement(
			InviteAccept,
			{
				siteId: context.params.site_id,
				inviteKey: context.params.invitation_key,
				activationKey: context.params.activation_key,
				authKey: context.params.auth_key
			}
		),
		document.getElementById( 'primary' ),
		context.store
	);
}
