import config from '@automattic/calypso-config';

const A4A_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.a4a.localhost' ];

export function isAllowedA4ADashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '-a4a.calypso.live' ) ) {
		return true;
	}

	return A4A_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildA4ADashboardLink( path: string = '' ) {
	if ( config( 'env' ) === 'development' ) {
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://my.a4a.localhost:${ port }` ).href;
	}
	// TODO: Add the A4A domain once it's ready.
	return path;
}
