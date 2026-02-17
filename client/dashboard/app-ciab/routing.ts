import config from '@automattic/calypso-config';

const CIAB_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.woo.localhost', 'my.woo.com' ];

export function isAllowedCiabDashboardHostname( hostname?: string ): boolean {
	return CIAB_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function getCiabDashboardBasePath( hostname: string ): string {
	return isAllowedCiabDashboardHostname( hostname ) ? '/' : '/ciab';
}

export function buildCiabDashboardLink( path: string = '' ) {
	// TODO: replace the base URL with the new domain when it's ready.

	if ( config( 'env' ) === 'development' ) {
		return new URL( `/ciab${ path }`, 'http://my.localhost:3000' ).href;
	}
	return new URL( `/ciab${ path }`, 'https://my.wordpress.com' ).href;
}
