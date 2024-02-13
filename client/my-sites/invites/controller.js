import page from '@automattic/calypso-router';
import { getLocaleFromPath, removeLocaleFromPath } from '@automattic/i18n-utils';
import debugModule from 'debug';
import { useTranslate } from 'i18n-calypso';
import store from 'store';
import DocumentHead from 'calypso/components/data/document-head';
import { navigate } from 'calypso/lib/navigate';
import InviteAccept from 'calypso/my-sites/invites/invite-accept';
import { getRedirectAfterAccept } from 'calypso/my-sites/invites/utils';
import { setUserEmailVerified } from 'calypso/state/current-user/actions';
import { getCurrentUserEmail, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { acceptInvite as acceptInviteAction } from 'calypso/state/invites/actions';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:invite-accept:controller' );

export function redirectWithoutLocaleifLoggedIn( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) && getLocaleFromPath( context.path ) ) {
		return page.redirect( removeLocaleFromPath( context.path ) );
	}

	next();
}

export function acceptInvite( context, next ) {
	const acceptedInvite = store.get( 'invite_accepted' );
	if ( acceptedInvite ) {
		debug( 'invite_accepted is set in localStorage' );
		if ( getCurrentUserEmail( context.store.getState() ) === acceptedInvite.sentTo ) {
			debug( 'Setting email_verified in user object' );
			context.store.dispatch( setUserEmailVerified( true ) );
		}
		store.remove( 'invite_accepted' );
		const emailVerificationSecret = context.query.email_verification_secret;

		context.store
			.dispatch( acceptInviteAction( acceptedInvite, emailVerificationSecret ) )
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

	const AcceptInviteTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Accept Invite', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<AcceptInviteTitle />
			<InviteAccept
				siteId={ context.params.site_id }
				inviteKey={ context.params.invitation_key }
				activationKey={ context.params.activation_key }
				authKey={ context.params.auth_key }
				locale={ context.params.locale }
				path={ context.path }
			/>
		</>
	);
	next();
}
