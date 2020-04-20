/**
 * External dependencies
 */
import React from 'react';
import store from 'store';
import page from 'page';
import { get } from 'lodash';
import debugModule from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import InviteAccept from 'my-sites/invites/invite-accept';
import { hideSidebar } from 'state/ui/actions';
import { getRedirectAfterAccept } from 'my-sites/invites/utils';
import { acceptInvite as acceptInviteAction } from 'lib/invites/actions';
import _user from 'lib/user';
import { getLocaleFromPath, removeLocaleFromPath } from 'lib/i18n-utils';

/**
 * Module variables
 */
const user = _user();
const debug = debugModule( 'calypso:invite-accept:controller' );

export function redirectWithoutLocaleifLoggedIn( context, next ) {
	if ( user.get() && getLocaleFromPath( context.path ) ) {
		return page.redirect( removeLocaleFromPath( context.path ) );
	}

	next();
}

export function acceptInvite( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Accept Invite', { textOnly: true } ) ) );

	context.store.dispatch( hideSidebar() );

	const acceptedInvite = store.get( 'invite_accepted' );
	if ( acceptedInvite ) {
		debug( 'invite_accepted is set in localStorage' );
		if ( user.get().email === acceptedInvite.sentTo ) {
			debug( 'Setting email_verified in user object' );
			user.set( { email_verified: true } );
		}
		store.remove( 'invite_accepted' );
		const acceptInviteCallback = ( error ) => {
			if ( error ) {
				debug( 'Accept invite error: ' + JSON.stringify( error ) );
				page( window.location.href );
			} else if ( get( acceptedInvite, 'site.is_vip' ) ) {
				debug( 'Accepted invite for VIP sites' );
				window.location.href = getRedirectAfterAccept( acceptedInvite );
			} else {
				const redirect = getRedirectAfterAccept( acceptedInvite );

				debug( 'Accepted invite and redirecting to:  ' + redirect );
				page( redirect );
			}
		};

		acceptInviteAction( acceptedInvite, acceptInviteCallback )( context.store.dispatch );
		return;
	}

	context.primary = React.createElement( InviteAccept, {
		siteId: context.params.site_id,
		inviteKey: context.params.invitation_key,
		activationKey: context.params.activation_key,
		authKey: context.params.auth_key,
		locale: context.params.locale,
		path: context.path,
	} );
	next();
}
