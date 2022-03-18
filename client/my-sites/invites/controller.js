import debugModule from 'debug';
import i18n from 'i18n-calypso';
import page from 'page';
import store from 'store';
import { getLocaleFromPath, removeLocaleFromPath } from 'calypso/lib/i18n-utils';
import { navigate } from 'calypso/lib/navigate';
import InviteAccept from 'calypso/my-sites/invites/invite-accept';
import { getRedirectAfterAccept } from 'calypso/my-sites/invites/utils';
import { setUserEmailVerified } from 'calypso/state/current-user/actions';
import { getCurrentUserEmail, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import { acceptInvite as acceptInviteAction } from 'calypso/state/invites/actions';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:invite-accept:controller' );

export function redirectWithoutLocaleIfLoggedIn( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) && getLocaleFromPath( context.path ) ) {
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
		if ( getCurrentUserEmail( context.store.getState() ) === acceptedInvite.sentTo ) {
			debug( 'Setting email_verified in user object' );
			context.store.dispatch( setUserEmailVerified( true ) );
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

	context.primary = (
		<InviteAccept
			siteId={ context.params.site_id }
			inviteKey={ context.params.invitation_key }
			activationKey={ context.params.activation_key }
			authKey={ context.params.auth_key }
			path={ context.path }
		/>
	);

	next();
}
