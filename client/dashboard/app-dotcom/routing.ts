import config from '@automattic/calypso-config';
import { calypsoLiveRedirectorLink } from '../utils/link';

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '.calypso.live' ) ) {
		return ! hostname.endsWith( '-a4a.calypso.live' );
	}

	return DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildDotcomDashboardLink( path: string = '' ) {
	// Untangling prototype on static hosting (Spacefast): the dashboard lives
	// on whatever origin serves the page.
	if (
		typeof window !== 'undefined' &&
		( window as { __UNTANGLING_STATIC__?: unknown } ).__UNTANGLING_STATIC__
	) {
		return new URL( path, window.location.origin ).href;
	}
	const liveLink = calypsoLiveRedirectorLink( path, 'dashboard' );
	if ( liveLink ) {
		return liveLink;
	}
	if ( config( 'env' ) === 'development' ) {
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://my.localhost:${ port }` ).href;
	}
	return new URL( path, 'https://my.wordpress.com' ).href;
}
