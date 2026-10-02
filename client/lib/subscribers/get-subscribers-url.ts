import { getCalypsoUrl } from '@automattic/calypso-url';
import {
	hasNewsletterSubscribersPage as siteHasNewsletterSubscribersPage,
	newsletterAdminUrl,
} from '@automattic/newsletter-urls';
import {
	getSiteAdminUrl,
	getSiteOption,
	getSiteSlug,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import type { NewsletterAdminUrlOptions } from '@automattic/newsletter-urls';
import type { AppState } from 'calypso/types';

/** Both the wp-admin Newsletter page and the Jetpack Cloud list open their Add subscribers
 * modal from this hash. */
export const ADD_SUBSCRIBERS_HASH = '#add-subscribers';

interface SiteFallback {
	/** Site URL to build wp-admin from when the site's admin URL isn't in state. */
	fallbackSiteUrl?: string;
}

interface SubscribersUrlOptions extends SiteFallback {
	/** Opens this subscriber's details instead of the list. */
	subscriptionId?: number | null;
	/** The subscriber's WordPress.com user id, absent for email-only subscribers. */
	userId?: number | null;
	/** Opens the Add subscribers modal on arrival. */
	addSubscribers?: boolean;
}

/**
 * Whether the site manages subscribers on the wp-admin Newsletter page rather than on
 * Jetpack Cloud.
 */
export function hasNewsletterSubscribersPage( state: AppState, siteId: number | null ): boolean {
	if ( ! siteId ) {
		return true;
	}

	return siteHasNewsletterSubscribersPage( {
		isSelfHostedJetpack: !! isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ),
		jetpackVersion: getSiteOption( state, siteId, 'jetpack_version' ) as string | undefined,
	} );
}

/**
 * A link into the site's wp-admin Newsletter page.
 * @returns The URL, or null when the site's wp-admin location is unknown.
 */
export function getNewsletterPageUrl(
	state: AppState,
	siteId: number | null,
	{ fallbackSiteUrl, ...options }: NewsletterAdminUrlOptions & SiteFallback
): string | null {
	const adminUrl =
		getSiteAdminUrl( state, siteId ) ??
		( fallbackSiteUrl ? `${ fallbackSiteUrl }/wp-admin/` : null );

	return adminUrl ? newsletterAdminUrl( adminUrl, options ) : null;
}

/**
 * Where to send someone to manage a site's subscribers, or one subscriber's details.
 */
export function getSubscribersUrl(
	state: AppState,
	siteId: number | null,
	{ subscriptionId, userId, addSubscribers, fallbackSiteUrl }: SubscribersUrlOptions = {}
): string {
	const hash = addSubscribers ? ADD_SUBSCRIBERS_HASH : '';

	if ( hasNewsletterSubscribersPage( state, siteId ) ) {
		const url = getNewsletterPageUrl( state, siteId, {
			tab: 'subscribers',
			subscriber: subscriptionId ?? undefined,
			user: userId ?? undefined,
			fallbackSiteUrl,
		} );

		if ( url ) {
			return `${ url }${ hash }`;
		}

		// Nothing in state says where this site's wp-admin lives. The Calypso route is kept
		// as a redirect target for exactly this, and for links sent before the move.
		// `getCalypsoUrl` honours the `calypso_origin` query arg, so a link built from
		// wp-admin in a dev or testing context goes back to the Calypso that sent the user.
		return `${ getCalypsoUrl( `/subscribers/${ getSiteSlug( state, siteId ) ?? '' }` ) }${ hash }`;
	}

	const slug = getSiteSlug( state, siteId ) ?? '';

	return `https://cloud.jetpack.com/subscribers/${ slug }${
		subscriptionId ? `/${ subscriptionId }` : ''
	}${ hash }`;
}
