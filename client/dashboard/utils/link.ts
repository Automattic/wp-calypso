import config from '@automattic/calypso-config';
import { getCurrentDashboard, getDashboardFromQuery, buildDashboardLink } from '../app/routing';
import { isDashboardBackport } from './is-dashboard-backport';

/**
 * This function returns all the origins for the dashboard.
 */
export function dashboardOrigins(): string[] {
	return [
		'http://my.localhost:3000',
		'https://my.wordpress.com',
		'http://my.woo.localhost:3000',
		'https://my.woo.com',
	];
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
 * This function returns the link to the dashboard.
 */
export function dashboardLink( path: string = '' ) {
	const dashboard = getDashboardFromQuery() ?? getCurrentDashboard();
	return buildDashboardLink( dashboard, path );
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
