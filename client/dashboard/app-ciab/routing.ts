import config from '@automattic/calypso-config';

const CIAB_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.woo.localhost', 'my.woo.ai' ];

export function isAllowedCiabDashboardHostname( hostname?: string ): boolean {
	return CIAB_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function getCiabDashboardBasePath( hostname: string ): string {
	return isAllowedCiabDashboardHostname( hostname ) ? '/' : '/ciab';
}

export function buildCiabDashboardLink( path: string = '' ) {
	if ( config( 'env' ) === 'development' ) {
		return new URL( `/ciab${ path }`, 'http://my.localhost:3000' ).href;
	}
	return new URL( path, 'https://my.woo.ai' ).href;
}
