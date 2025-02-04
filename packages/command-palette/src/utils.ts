import { recordTracksEvent } from '@automattic/calypso-analytics';
import type { CommandCallBackParams } from './commands';
import type { SiteExcerptData } from '@automattic/sites';

export function isCustomDomain( siteSlug: string | null | undefined ): boolean {
	if ( ! siteSlug ) {
		return false;
	}
	return ! siteSlug.endsWith( '.wordpress.com' ) && ! siteSlug.endsWith( '.wpcomstaging.com' );
}

export const siteUsesWpAdminInterface = ( site: SiteExcerptData | undefined ) =>
	( site?.jetpack && ! site?.is_wpcom_atomic ) ||
	site?.options?.wpcom_admin_interface === 'wp-admin';

export const commandNavigation =
	( path: string, openInNewTab?: boolean ) =>
	( { site, close, navigate, command, currentRoute }: CommandCallBackParams ) => {
		let url = path;

		url = url.replace( /:site/g, site?.slug ?? '' );
		url = url.replace( /:siteId/g, site?.ID?.toString() ?? '' );

		// Navigate from Calypso to WP Admin.
		if ( url.startsWith( '/wp-admin' ) && ! currentRoute.startsWith( '/wp-admin' ) ) {
			url = `https://${ site?.slug }${ url }`;
		}

		// Navigate from WP Admin to Calypso.
		if (
			url.startsWith( '/' ) &&
			! url.startsWith( '/wp-admin' ) &&
			currentRoute.startsWith( '/wp-admin' )
		) {
			url = `https://wordpress.com${ url }`;
		}

		recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
			command: command.name,
			current_route: currentRoute,
			is_wp_admin: url.includes( '/wp-admin' ),
		} );
		close();
		navigate( url, openInNewTab );
	};
