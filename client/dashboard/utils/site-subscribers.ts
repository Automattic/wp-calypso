import { newsletterAdminUrl } from '@automattic/newsletter-urls';
import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

// Newsletter > Subscribers shipped in Jetpack 16.1. Self-hosted sites below that still manage
// subscribers on Jetpack Cloud. Mirrors `get_jetpack_subscribers_url()` on the backend.
const NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION = [ 16, 1 ];

/**
 * Whether a Jetpack version string is at least `minimum`, following the backend's
 * `version_compare()` on the shapes Jetpack ships: `16.1.1` is above `16.1`, and a prerelease
 * of the minimum itself (`16.1-beta`) is below it, while a prerelease of anything higher
 * (`17.0-beta`) is not.
 */
function isAtLeastVersion( jetpackVersion: string, minimum: number[] ): boolean {
	const parts = jetpackVersion.match( /\d+/g )?.map( Number );

	if ( ! parts?.length ) {
		return false;
	}

	for ( let index = 0; index < Math.max( parts.length, minimum.length ); index++ ) {
		const part = parts[ index ] ?? 0;
		const min = minimum[ index ] ?? 0;

		if ( part !== min ) {
			return part > min;
		}
	}

	// Numerically identical, so only a prerelease suffix separates them.
	return /^\d+(\.\d+)*$/.test( jetpackVersion );
}

function hasNewsletterSubscribersPage( site: Site ): boolean {
	if ( ! isSelfHostedJetpackConnected( site ) ) {
		return true;
	}

	const jetpackVersion = site.options?.jetpack_version;

	return (
		!! jetpackVersion && isAtLeastVersion( jetpackVersion, NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION )
	);
}

/**
 * Where to send someone to manage a site's subscribers.
 */
export function getSiteSubscribersUrl( site: Site ): string {
	const adminUrl = site.options?.admin_url;

	if ( hasNewsletterSubscribersPage( site ) && adminUrl ) {
		return newsletterAdminUrl( adminUrl, { tab: 'subscribers' } );
	}

	return `https://cloud.jetpack.com/subscribers/${ site.slug }`;
}
