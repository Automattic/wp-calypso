import config from '@automattic/calypso-config';
import { getCurrentDashboard, getDashboardFromQuery, buildDashboardLink } from '../app/routing';
import { A4A_SIGNUP_PATHS } from '../section';
import { isDashboardBackport } from './is-dashboard-backport';

const CALYPSO_LIVE_ORIGIN = 'https://calypso.live';

/**
 * On a calypso.live preview, returns a redirector link that resolves to the
 * previewed build's container for the given app flavour. Returns null
 * everywhere else, so callers fall back to their normal static URLs.
 *
 * `env` selects the flavour: 'wpcom' for classic Calypso, 'dashboard' for the
 * my.wordpress.com Dashboard. The redirector carries the path and any remaining
 * query params across its 302.
 */
export function calypsoLiveRedirectorLink(
	path: string,
	env: 'wpcom' | 'dashboard'
): string | null {
	const image = config( 'calypso_live_image' );
	if ( ! image ) {
		return null;
	}

	const url = new URL( path, CALYPSO_LIVE_ORIGIN );

	if ( url.origin !== CALYPSO_LIVE_ORIGIN ) {
		// `path` was an absolute URL.
		return null;
	}

	url.searchParams.set( 'image', String( image ) );
	if ( env === 'dashboard' ) {
		url.searchParams.set( 'env', env );
	}
	return url.href;
}

/**
 * This function returns all the origins for the dashboard.
 */
export function dashboardOrigins(): string[] {
	const port = config( 'port' ) ?? 3000;
	const origins = [
		`http://my.localhost:${ port }`,
		'https://my.wordpress.com',
		`http://my.woo.localhost:${ port }`,
		'https://my.woo.ai',
		`http://my.a4a.localhost:${ port }`,
	];

	// On calypso.live previews both apps are reached through the redirector,
	// so back_to/cancel_to round trips land on this origin.
	if ( config( 'calypso_live_image' ) ) {
		origins.push( 'https://calypso.live' );
	}

	return origins;
}

/**
 * This function essentially returns `https://wordpress.com${ path }`.
 *
 * However, the hostname is configurable in the `wpcom_url` key, so that
 * we can point to different hostname in different environments.
 *
 * For example, the value is set to `calypso.localhost:3000` in `config/dashboard-development.json`,
 * so that the link points to the local Calypso dev server.
 *
 * Exception: for CIAB dashboard, we will use the dashboard origin to serve signup, stepper, and checkout links.
 * This is a temporary measure until we reimplement the screen natively in the dashboard.
 */
export function wpcomLink( path: string ) {
	if (
		[ '/start', '/setup', '/checkout' ].some(
			( prefix ) => path === prefix || path.startsWith( prefix + '/' )
		)
	) {
		const dashboard = getCurrentDashboard();
		if ( dashboard === 'ciab' ) {
			return path;
		}
	}
	if ( A4A_SIGNUP_PATHS.some( ( prefix ) => path === prefix || path.startsWith( prefix + '/' ) ) ) {
		const dashboard = getCurrentDashboard();
		if ( dashboard === 'a4a' ) {
			return path;
		}
	}
	return calypsoLiveRedirectorLink( path, 'wpcom' ) ?? new URL( path, config( 'wpcom_url' ) ).href;
}

/**
 * This function returns a link to the A4A (Automattic for Agencies) domain.
 */
export function a4aLink( path: string ) {
	if ( config( 'env' ) === 'development' ) {
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://agencies.localhost:${ port }` ).href;
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
