import { getSafeUrl } from 'calypso/lib/site-launch/destination';
import { sanitizeDirectToCartRedirect } from '../../../flows/direct-to-cart/sanitize-redirect';

interface SiteAddress {
	URL?: string;
	options?: { unmapped_url?: string };
}

/**
 * The `redirect_to` to follow once a transfer is done, or null. Callers link to the site's host
 * from before the transfer or after it. A reload that resumes the wait has no earlier site, but
 * `foo.wordpress.com` still redirects to `foo.wpcomstaging.com`, so that host is followed too.
 * Direct-to-cart sends partners back here, so their allowlisted hosts are followed as well.
 */
export function getTransferRedirectTo(
	redirectTo: string | null,
	siteBefore: SiteAddress | null | undefined,
	siteAfter: SiteAddress
) {
	const unmappedUrl = siteAfter.options?.unmapped_url;
	const siteUrls = [
		siteBefore?.URL,
		siteAfter.URL,
		unmappedUrl,
		unmappedUrl?.replace( /\.wpcomstaging\.com(\/?)$/, '.wordpress.com$1' ),
	];

	return (
		siteUrls.map( ( siteUrl ) => getSafeUrl( redirectTo, siteUrl ) ).find( Boolean ) ??
		sanitizeDirectToCartRedirect( redirectTo )
	);
}
