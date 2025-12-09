import isDashboard from './is-dashboard';

export function isDashboardBackport() {
	// No need to check for backport if it's a dashboard Calypso environment.
	if ( isDashboard() || window?.location?.hostname?.startsWith( 'my.localhost' ) ) {
		return false;
	}

	return ! [ '/v2', '/ciab' ].some( ( path ) => window?.location?.pathname?.startsWith( path ) );
}
