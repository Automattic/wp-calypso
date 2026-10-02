import { newsletterAdminUrl } from '@automattic/newsletter-urls';
import {
	getSiteAdminUrl,
	getSiteSlug,
	isJetpackMinimumVersion,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import type { NewsletterAdminUrlOptions } from '@automattic/newsletter-urls';
import type { AppState } from 'calypso/types';

// Newsletter > Subscribers shipped in Jetpack 16.1. Below that, `page=jetpack-newsletter`
// renders the legacy settings app and ignores the `p` route, so self-hosted sites below it
// keep the Jetpack Cloud subscriber list. Simple and Atomic sites always have the wp-admin
// page. Mirrors `get_jetpack_subscribers_url()` on the backend.
const NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION = '16.1';

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

	const isSelfHostedJetpack = !! isJetpackSite( state, siteId, {
		treatAtomicAsJetpackSite: false,
	} );

	return (
		! isSelfHostedJetpack ||
		!! isJetpackMinimumVersion( state, siteId, NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION )
	);
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
		return `https://wordpress.com/subscribers/${ getSiteSlug( state, siteId ) ?? '' }${ hash }`;
	}

	const slug = getSiteSlug( state, siteId ) ?? '';

	return `https://cloud.jetpack.com/subscribers/${ slug }${
		subscriptionId ? `/${ subscriptionId }` : ''
	}${ hash }`;
}
