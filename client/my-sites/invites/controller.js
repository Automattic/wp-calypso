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
import { acceptedNotice, getRedirectAfterAccept } from 'my-sites/invites/utils';
import { successNotice } from 'state/notices/actions';

export function acceptInvite( context ) {
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

export function inviteNotices( context, next ) {
	const acceptedInvite = store.get( 'invite_accepted' );
	if ( acceptedInvite ) {
		store.remove( 'invite_accepted' );
		context.store.dispatch( successNotice( ... acceptedNotice( acceptedInvite ) ) );
		page( getRedirectAfterAccept( acceptedInvite ) );
	} else {
		next();
	}
}
