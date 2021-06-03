/**
 * External dependencies
 */
import React from 'react';
import store from 'store';
import page from 'page';
import debugModule from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import InviteAccept from 'calypso/my-sites/invites/invite-accept';
import { getRedirectAfterAccept } from 'calypso/my-sites/invites/utils';
import { acceptInvite as acceptInviteAction } from 'calypso/state/invites/actions';
import user from 'calypso/lib/user';
import { getLocaleFromPath, removeLocaleFromPath } from 'calypso/lib/i18n-utils';
import { navigate } from 'calypso/lib/navigate';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:invite-accept:controller' );

export function redirectWithoutLocaleifLoggedIn( context, next ) {
	if ( user().get() && getLocaleFromPath( context.path ) ) {
		return page.redirect( removeLocaleFromPath( context.path ) );
	}

	next();
}

export function acceptInvite( context, next ) {
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Accept Invite', { textOnly: true } ) ) );

	const acceptedInvite = store.get( 'invite_accepted' );
	if ( acceptedInvite ) {
		debug( 'invite_accepted is set in localStorage' );
		if ( user().get().email === acceptedInvite.sentTo ) {
			debug( 'Setting email_verified in user object' );
			user().set( { email_verified: true } );
		}
		store.remove( 'invite_accepted' );

		context.store
			.dispatch( acceptInviteAction( acceptedInvite ) )
			.then( () => {
				const redirect = getRedirectAfterAccept( acceptedInvite );
				debug( 'Accepted invite and redirecting to:  ' + redirect );
				navigate( redirect );
			} )
			.catch( ( error ) => {
				debug( 'Accept invite error: ' + JSON.stringify( error ) );
				page( window.location.href );
			} );
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
