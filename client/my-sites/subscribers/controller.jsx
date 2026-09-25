import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getNewsletterPageUrl,
	getNewsletterSubscribersRoute,
	hasNewsletterSubscribersPage,
} from 'calypso/lib/subscribers/get-subscribers-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SubscribersPage from './main';

export function subscribers( context, next ) {
	context.primary = <SubscribersPage subscriberId={ context.params.subscriberId } />;
	next();
}

/**
 * Subscribers moved to the Newsletter page in wp-admin, but links to this route are still in
 * circulation — in notifications sent before the move, in bookmarks, and from the support
 * assistant, which builds its own. Send those on to the page that now owns the screen.
 *
 * Two audiences still belong here: Jetpack Cloud serves this screen to self-hosted sites below
 * Jetpack 16.1, whose wp-admin has no Subscribers tab yet, and so does this route when nothing
 * in state says where the site's wp-admin lives.
 */
export function redirectToNewsletter( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	if ( isJetpackCloud() || ! hasNewsletterSubscribersPage( state, siteId ) ) {
		next();
		return;
	}

	const { subscriberId } = context.params;
	const newsletterUrl = getNewsletterPageUrl( state, siteId, {
		route: getNewsletterSubscribersRoute( {
			subscriptionId: /^\d+$/.test( subscriberId ?? '' ) ? Number( subscriberId ) : undefined,
		} ),
	} );

	if ( ! newsletterUrl ) {
		next();
		return;
	}

	window.location.replace( newsletterUrl );
}
