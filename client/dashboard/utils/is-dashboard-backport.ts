import isDashboardEnv from './is-dashboard-env';

export function isDashboardBackport() {
	// No need to check for backport if it's a dashboard Calypso environment.
	if ( isDashboardEnv() ) {
		return false;
	}

	// Calypso development environment can also load the dashboard via the following hostnames,
	// in which case it's also not the backport.
	if (
		window?.location?.hostname?.startsWith( 'my.localhost' ) ||
		window?.location?.hostname?.startsWith( 'my.woo.localhost' )
	) {
		return false;
	}

	// We're on a dashboard screen in non-dashboard Calypso environment.
	return true;
}
