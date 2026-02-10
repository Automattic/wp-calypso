const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '.calypso.live' ) ) {
		return true;
	}

	return DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}
