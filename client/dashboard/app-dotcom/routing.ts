import config from '@automattic/calypso-config';
import { buildLinkFromBaseUrl } from '../utils/base-url';

const DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.localhost', 'my.wordpress.com' ];

export function isAllowedDotcomDashboardHostname( hostname?: string ): boolean {
	// Calypso Live links
	if ( hostname?.endsWith( '.calypso.live' ) ) {
		return ! hostname?.endsWith( '-ciab.calypso.live' );
	}

	return DOTCOM_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function buildDotcomDashboardLink( path: string = '' ) {
	return buildLinkFromBaseUrl( path, String( config( 'dashboard_url' ) ) );
}
