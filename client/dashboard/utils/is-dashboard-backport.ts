import isDashboardEnv from './is-dashboard-env';

export function isDashboardBackport() {
	// No need to check for backport if it's a dashboard Calypso environment.
	if ( isDashboardEnv() ) {
		return false;
	}

	// Calypso development environment can also load the dashboard via the following hostname,
	// in which case it's also not the backport.
	if ( window?.location?.hostname?.startsWith( 'my.localhost' ) ) {
		return false;
	}

	// At this point, it means this dashboard screen is in non-dashboard environments,
	// so it's a backport.
	return true;
}
