/**
 * Check if the given URL belongs to the Partner Portal. If true, returns the URL, otherwise it returns the
 * Partner Portal base URL: '/partner-portal'
 * @param {string} returnToUrl The URL that
 * @returns {string} The right URL to return to
 */
export default function ensurePartnerPortalReturnUrl( returnToUrl: string ): string {
	return returnToUrl && returnToUrl.startsWith( '/partner-portal' )
		? returnToUrl
		: '/partner-portal';
}
