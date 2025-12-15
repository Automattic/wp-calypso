import isDashboard from './is-dashboard';

export function isDashboardBackport() {
	// No need to check for backport if it's a dashboard Calypso environment.
	if ( isDashboard() ) {
		return false;
	}

	// Calypso development environment can also load the dashboard via the following hostname,
	// in which case it's also not the backport.
	if ( window?.location?.hostname?.startsWith( 'my.localhost' ) ) {
		return false;
	}

	return ! [ '/v2', '/ciab' ].some( ( path ) => window?.location?.pathname?.startsWith( path ) );
}
