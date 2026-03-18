import config from '@automattic/calypso-config';

const A4A_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.a4a.localhost' ];

export function isAllowedA4ADashboardHostname( hostname?: string ): boolean {
	return A4A_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildA4ADashboardLink( path: string = '' ) {
	if ( config( 'env' ) === 'development' ) {
		return new URL( path, 'http://my.a4a.localhost:3000' ).href;
	}
	// TODO: Add the A4A domain once it's ready.
}
