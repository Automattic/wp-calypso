import config from '@automattic/calypso-config';
import { isDashboardBackport } from './is-dashboard-backport';

/**
 * This function returns all the origins for the dashboard.
 */
export function dashboardOrigins(): string[] {
	return [ 'http://my.localhost:3000', 'https://my.wordpress.com' ];
}

/**
 * This function essentially returns `https://wordpress.com${ path }`.
 *
 * However, the hostname is configurable in the `wpcom_url` key, so that
 * we can point to different hostname in different environments.
 *
 * For example, the value is set to `calypso.localhost:3000` in `config/dashboard-development.json`,
 * so that the link points to the local Calypso dev server.
 */
export function wpcomLink( path: string ) {
	return new URL( path, config( 'wpcom_url' ) ).href;
}

/**
 * This function returns a link to the A4A (Automattic for Agencies) domain.
 */
export function a4aLink( path: string ) {
	if ( config( 'env' ) === 'development' ) {
		return new URL( path, 'http://agencies.localhost:3000' ).href;
	}

	return new URL( path, 'https://agencies.automattic.com' ).href;
}

/**
 * Dashboard type identifier.
 * undefined represents the default (main `dotcom` MSD dashboard).
 */
export type DashboardType = 'ciab' | 'dotcom';

/**
 * Returns the dashboard type from a string.
 */
export function getDashboardFromString( dashboard?: string ): DashboardType | null {
	if ( dashboard === 'ciab' || dashboard === 'dotcom' ) {
		return dashboard;
	}

	return null;
}

/**
 * Returns the dashboard type from URL query params.
 * Used when in Stepper to know which dashboard the user came from.
 */
function getDashboardFromQuery(): DashboardType | null {
	const params = new URLSearchParams( window.location.search );
	const dashboard = params.get( 'dashboard' );
	if ( dashboard === 'ciab' ) {
		return 'ciab';
	}
	return null;
}

/**
 * Returns the dashboard type from the current path.
 * Only detects ciab (which has a distinctive /ciab prefix).
 * Returns null for all other paths, falling through to default.
 */
function getDashboardFromPath(): DashboardType | null {
	if ( window.location.pathname.startsWith( '/ciab' ) ) {
		return 'ciab';
	}
	return null;
}

/**
 * Returns the dashboard type from the referrer.
 * Fallback when query param and path don't indicate dashboard.
 */
function getDashboardFromReferrer(): DashboardType | null {
	if ( ! document.referrer ) {
		return null;
	}
	try {
		const referrerUrl = new URL( document.referrer );
		if ( referrerUrl.pathname.startsWith( '/ciab' ) ) {
			return 'ciab';
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Detects the current dashboard context.
 * Priority: query param → current path → referrer → defaults to MSD
 */
export function getCurrentDashboard(): DashboardType {
	return (
		getDashboardFromQuery() ?? getDashboardFromPath() ?? getDashboardFromReferrer() ?? 'dotcom'
	);
}

/**
 * Returns the dashboard origin based on environment.
 */
function getDashboardOrigin(): string {
	if ( config( 'env' ) === 'development' ) {
		return 'http://my.localhost:3000';
	}
	return 'https://my.wordpress.com';
}

/**
 * This function returns the link to the dashboard.
 * Context-aware: automatically uses correct base path (/ciab for CIAB, root for default).
 */
export function dashboardLink( path: string = '' ) {
	const origin = getDashboardOrigin();

	// If path already has /ciab base, use as-is
	if ( path.startsWith( '/ciab' ) ) {
		return new URL( path, origin ).href;
	}

	// Detect dashboard context and add /ciab prefix if needed
	const dashboard = getCurrentDashboard();
	if ( dashboard === 'ciab' ) {
		return new URL( `/ciab${ path }`, origin ).href;
	}

	// Default dashboard uses root path (no prefix)
	return new URL( path, origin ).href;
}

/**
 * This function returns the link to the dashboard, with backport support.
 */
export function dashboardLinkWithBackport( path: string = '' ) {
	if ( isDashboardBackport() ) {
		return path;
	}

	return dashboardLink( path );
}

/**
 * This function returns the redirect link back to the dashboard.
 */
export function redirectToDashboardLink( {
	supportBackport,
}: {
	supportBackport?: boolean;
} = {} ) {
	const url = window.location.href.replace( window.location.origin, '' );
	return supportBackport ? dashboardLinkWithBackport( url ) : dashboardLink( url );
}

/**
 * This function returns the link to the reauth page.
 *
 * Currently, the dashboard run in either Calypso or Dashboard environment. When it comes to the redirect URL:
 * - For Calypso, the reauth page is hosted on the same origin so we use window.location.pathname.
 * - For Dashboard, the reauth page isn't hosted on the same origin so we use window.location.href.
 */
export function reauthRequiredLink() {
	const wpcomUrl = String( config( 'wpcom_url' ) ?? '' );
	const isSameOrigin = wpcomUrl.startsWith( window.location.origin );
	const currentPath = isSameOrigin ? window.location.pathname : window.location.href;

	return `${ wpcomUrl }/me/reauth-required?redirect_to=${ encodeURIComponent( currentPath ) }`;
}
