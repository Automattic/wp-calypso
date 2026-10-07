import { hasNewsletterSubscribersPage, newsletterAdminUrl } from '@automattic/newsletter-urls';
import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

/**
 * Where to send someone to manage a site's subscribers.
 */
export function getSiteSubscribersUrl( site: Site ): string {
	const adminUrl = site.options?.admin_url;
	const usesNewsletterPage = hasNewsletterSubscribersPage( {
		isSelfHostedJetpack: !! isSelfHostedJetpackConnected( site ),
		jetpackVersion: site.options?.jetpack_version,
	} );

	if ( usesNewsletterPage && adminUrl ) {
		return newsletterAdminUrl( adminUrl, { tab: 'subscribers' } );
	}

	return `https://cloud.jetpack.com/subscribers/${ site.slug }`;
}
