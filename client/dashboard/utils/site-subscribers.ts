import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

// Newsletter > Subscribers shipped in Jetpack 16.1. Self-hosted sites below that still manage
// subscribers on Jetpack Cloud. Mirrors `get_jetpack_subscribers_url()` on the backend.
const NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION = [ 16, 1 ];

function isAtLeast( version: number[], minimum: number[] ): boolean {
	for ( let index = 0; index < minimum.length; index++ ) {
		const part = version[ index ] ?? 0;

		if ( part !== minimum[ index ] ) {
			return part > minimum[ index ];
		}
	}

	return true;
}

function hasNewsletterSubscribersPage( site: Site ): boolean {
	if ( ! isSelfHostedJetpackConnected( site ) ) {
		return true;
	}

	const version = site.options?.jetpack_version?.match( /\d+/g )?.map( Number );

	return !! version?.length && isAtLeast( version, NEWSLETTER_SUBSCRIBERS_JETPACK_VERSION );
}

/**
 * Where to send someone to manage a site's subscribers.
 */
export function getSiteSubscribersUrl( site: Site ): string {
	const adminUrl = site.options?.admin_url;

	if ( hasNewsletterSubscribersPage( site ) && adminUrl ) {
		// The Newsletter page reads its route from `p`, and opens on Overview where that is
		// enabled, so the Subscribers tab has to be asked for by name.
		return `${ adminUrl }admin.php?page=jetpack-newsletter&p=${ encodeURIComponent(
			'/?tab=subscribers'
		) }`;
	}

	return `https://cloud.jetpack.com/subscribers/${ site.slug }`;
}
