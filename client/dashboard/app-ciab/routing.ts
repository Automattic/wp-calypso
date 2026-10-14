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
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://my.woo.localhost:${ port }` ).href;
	}
	return new URL( path, 'https://my.woo.ai' ).href;
}
