/**
 * Extract a site's hostname for display — parity with the classic `SiteDetails.domain`,
 * which the api-core `Site` type does not expose directly.
 */
export function getSiteDomain( siteUrl: string ): string {
	try {
		return new URL( siteUrl ).host;
	} catch {
		return siteUrl;
	}
}
