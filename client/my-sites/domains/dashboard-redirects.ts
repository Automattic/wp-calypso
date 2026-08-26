const WPCOM_ADDRESS_SUFFIX = '.wordpress.com';
const WPCOM_STAGING_ADDRESS_SUFFIX = '.wpcomstaging.com';

/**
 * Where the dashboard manages the domain behind a classic domain management URL.
 *
 * Registered and mapped domains have an overview page of their own. A site's
 * WordPress.com address does not: the dashboard's domains list renders it as plain
 * text rather than a link, because the only thing to manage is the site address,
 * which lives on the site's Domains page. A staging address can't be changed at
 * all, so it lands on the same page with nothing opened.
 *
 * @param {Object} params Route params.
 * @param {string} params.domain The domain being managed.
 * @param {string} [params.site] The slug of the site it belongs to.
 * @returns {string} The dashboard path to redirect to.
 */
export function getDashboardDomainManagementPath( {
	domain,
	site,
}: {
	domain: string;
	site?: string;
} ): string {
	if ( site ) {
		if ( domain.endsWith( WPCOM_ADDRESS_SUFFIX ) ) {
			return `/sites/${ site }/domains?action=change-site-address`;
		}

		if ( domain.endsWith( WPCOM_STAGING_ADDRESS_SUFFIX ) ) {
			return `/sites/${ site }/domains`;
		}
	}

	return `/domains/${ domain }`;
}
