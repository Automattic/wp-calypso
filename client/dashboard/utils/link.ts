import config from '@automattic/calypso-config';

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
	return `${ config( 'wpcom_url' ) }${ path }`;
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
