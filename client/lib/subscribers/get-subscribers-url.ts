import {
	getSiteAdminUrl,
	getSiteSlug,
	isJetpackMinimumVersion,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

// Newsletter > Subscribers shipped in Jetpack 16.1. Below that, `page=jetpack-newsletter`
// renders the legacy settings app and ignores the `p` route, so self-hosted sites below it
// keep the Jetpack Cloud subscriber list. Simple and Atomic sites always have the wp-admin
// page. Mirrors `get_jetpack_subscribers_url()` on the backend.
const NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION = '16.1';

interface NewsletterPageOptions {
	/** Route inside the Newsletter router, e.g. `/?tab=settings`. */
	route?: string;
	/** Site URL to build wp-admin from when the site's admin URL isn't in state. */
	fallbackSiteUrl?: string;
}

interface SubscribersUrlOptions {
	/** Opens this subscriber's details instead of the list. */
	subscriptionId?: number | null;
	/** The subscriber's WordPress.com user id, absent for email-only subscribers. */
	userId?: number | null;
	/** Opens the Add subscribers modal on arrival. */
	addSubscribers?: boolean;
	fallbackSiteUrl?: string;
}

// Both the wp-admin Newsletter page and the Jetpack Cloud list open their Add subscribers
// modal from this hash.
const ADD_SUBSCRIBERS_HASH = '#add-subscribers';

/**
 * Whether the site manages subscribers on the wp-admin Newsletter page rather than on
 * Jetpack Cloud.
 */
export function hasNewsletterSubscribersPage( state: AppState, siteId: number | null ): boolean {
	if ( ! siteId ) {
		return true;
	}

	const isSelfHostedJetpack = !! isJetpackSite( state, siteId, {
		treatAtomicAsJetpackSite: false,
	} );

	return (
		! isSelfHostedJetpack ||
		!! isJetpackMinimumVersion( state, siteId, NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION )
	);
}

/**
 * Builds a URL into the wp-admin Newsletter page. The page is a router mounted on
 * `admin.php?page=jetpack-newsletter` that reads its route from the `p` query param, so a
 * view inside it has to be asked for as an encoded route rather than a plain query arg.
 * @returns The URL, or null when the site's wp-admin location is unknown.
 */
export function getNewsletterPageUrl(
	state: AppState,
	siteId: number | null,
	options: NewsletterPageOptions & { fallbackSiteUrl: string }
): string;
export function getNewsletterPageUrl(
	state: AppState,
	siteId: number | null,
	options?: NewsletterPageOptions
): string | null;
export function getNewsletterPageUrl(
	state: AppState,
	siteId: number | null,
	{ route, fallbackSiteUrl }: NewsletterPageOptions = {}
): string | null {
	const adminPhpUrl =
		getSiteAdminUrl( state, siteId, 'admin.php' ) ??
		( fallbackSiteUrl ? `${ fallbackSiteUrl }/wp-admin/admin.php` : null );

	if ( ! adminPhpUrl ) {
		return null;
	}

	const newsletterUrl = `${ adminPhpUrl }?page=jetpack-newsletter`;

	return route ? `${ newsletterUrl }&p=${ encodeURIComponent( route ) }` : newsletterUrl;
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
		// `tab` is only read from inside the route, and the Subscribers tab has to be asked
		// for by name: the page opens on Overview where that is enabled, and the subscriber
		// details panel renders on no other tab.
		let route = '/?tab=subscribers';

		if ( subscriptionId ) {
			route += `&subscriber=${ subscriptionId }${ userId ? `&u=${ userId }` : '' }`;
		}

		const newsletterUrl = getNewsletterPageUrl( state, siteId, { route, fallbackSiteUrl } );

		if ( newsletterUrl ) {
			return `${ newsletterUrl }${ hash }`;
		}

		// Nothing in state says where this site's wp-admin lives. The Calypso route is kept
		// as a redirect target for exactly this, and for links sent before the move.
		return `https://wordpress.com/subscribers/${ getSiteSlug( state, siteId ) ?? '' }${ hash }`;
	}

	const slug = getSiteSlug( state, siteId ) ?? '';

	return `https://cloud.jetpack.com/subscribers/${ slug }${
		subscriptionId ? `/${ subscriptionId }` : ''
	}${ hash }`;
}
