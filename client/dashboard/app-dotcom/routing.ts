import config from '@automattic/calypso-config';

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '.calypso.live' ) ) {
		return ! hostname?.endsWith( '-ciab.calypso.live' );
	}

	return DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildDotcomDashboardLink( path: string = '' ) {
	const safePath = path.replace( /^\/\/+/, '/' );
	if ( config( 'env' ) === 'development' ) {
		return new URL( safePath, 'http://my.localhost:3000' ).href;
	}
	return new URL( safePath, 'https://my.wordpress.com' ).href;
}
