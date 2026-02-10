export const DOTCOM_DASHBOARD_SECTION_DEFINITION = {
	name: 'dashboard-dotcom',
	module: 'dashboard/app-dotcom',
};

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHost( host?: string ): boolean {
	return (
		DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.some( ( hostname ) => host?.startsWith( hostname ) ) ||
		!! host?.endsWith( '.calypso.live' ) // Calypso Live links
	);
}
