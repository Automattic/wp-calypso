import config from '@automattic/calypso-config';
import { calypsoLiveLink } from '../utils/calypso-live';

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '.calypso.live' ) ) {
		return ! hostname?.endsWith( '-ciab.calypso.live' );
	}

	return DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildDotcomDashboardLink( path: string = '' ) {
	const liveLink = calypsoLiveLink( path, 'dashboard' );
	if ( liveLink ) {
		return liveLink;
	}
	if ( config( 'env' ) === 'development' ) {
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://my.localhost:${ port }` ).href;
	}
	return new URL( path, 'https://my.wordpress.com' ).href;
}
