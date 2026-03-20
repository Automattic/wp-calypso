import config from '@automattic/calypso-config';

const CIAB_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.woo.localhost', 'my.woo.ai' ];

export function isAllowedCiabDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '-ciab.calypso.live' ) ) {
		return true;
	}

	return CIAB_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildCiabDashboardLink( path: string = '' ) {
	if ( config( 'env' ) === 'development' ) {
		return new URL( path, 'http://my.woo.localhost:3000' ).href;
	}
	return new URL( path, 'https://my.woo.ai' ).href;
}
