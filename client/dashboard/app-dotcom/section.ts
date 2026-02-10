export const DOTCOM_DASHBOARD_SECTION_DEFINITION = {
	name: 'dashboard-dotcom',
	module: 'dashboard/app-dotcom',
};

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname: string ): boolean {
	return (
		DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ) ||
		// Calypso Live links
		hostname.endsWith( '.calypso.live' )
	);
}
