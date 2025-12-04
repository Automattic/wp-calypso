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
