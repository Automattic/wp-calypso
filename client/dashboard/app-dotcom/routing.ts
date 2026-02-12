import config from '@automattic/calypso-config';

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '.calypso.live' ) ) {
		return true;
	}

	return DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildDotcomDashboardLink( path: string = '' ) {
	if ( config( 'env' ) === 'development' ) {
		return new URL( path, 'http://my.localhost:3000' ).href;
	}
	return new URL( path, 'https://my.wordpress.com' ).href;
}
