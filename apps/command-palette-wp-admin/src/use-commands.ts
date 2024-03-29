import { recordTracksEvent } from '@automattic/calypso-analytics';
import { COMMANDS } from '@automattic/command-palette';
import deepmerge from 'deepmerge';
import type { Command, CommandCallBackParams } from '@automattic/command-palette';

const currentRoute = window.location.pathname + window.location.search;

const commandNavigation =
	( path: string, { openInNewTab = false } = {} ) =>
	( { close, command }: Pick< CommandCallBackParams, 'close' | 'command' > ) => {
		const { siteId, siteHostname } = window?.commandPaletteConfig || {};

		let url = path;

		if ( path.startsWith( '/' ) && ! path.startsWith( '/wp-admin' ) ) {
			url = `https://wordpress.com${ path }`;
		}

		url = url.replace( /:site/g, siteHostname );
		url = url.replace( /:siteId/g, siteId );

		if ( url.startsWith( siteHostname ) ) {
			url = url.replace( siteHostname, window.location.origin );
		}

		recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
			command: command.name,
			current_route: currentRoute,
			is_wp_admin: url.includes( '/wp-admin' ),
		} );
		close();
		window.open( url, openInNewTab ? '_blank' : '_self' );
	};

const waitForElementAndClick = ( selector: string, attempt = 1 ) => {
	const element = document.querySelector< HTMLElement >( selector );
	if ( element ) {
		element.click();
	} else if ( attempt <= 5 ) {
		// Try again in 250ms, but no more than 5 times.
		setTimeout( () => waitForElementAndClick( selector, attempt + 1 ), 250 );
	}
};

export const useCommandsWpAdmin = (): Command[] => {
	return Object.values(
		deepmerge( COMMANDS, {
			viewMySites: {
				callback: commandNavigation( '/sites' ),
			},
			getHelp: {
				callback: ( { close }: CommandCallBackParams ) => {
					close();
					waitForElementAndClick( '#wp-admin-bar-help-center' );
				},
			},
			clearCache: {
				callback: commandNavigation( '/hosting-config/:site#cache' ),
			},
			enableEdgeCache: {
				callback: commandNavigation( '/hosting-config/:site#edge' ),
			},
			disableEdgeCache: {
				callback: commandNavigation( '/hosting-config/:site#edge' ),
			},
			manageCacheSettings: {
				callback: commandNavigation( '/hosting-config/:site#cache' ),
			},
			visitSite: {
				callback: commandNavigation( ':site' ),
			},
			openSiteDashboard: {
				callback: commandNavigation( '/wp-admin' ),
			},
			openHostingConfiguration: {
				callback: commandNavigation( '/hosting-config/:site' ),
			},
			openPHPmyAdmin: {
				callback: commandNavigation( '/hosting-config/:site#database-access' ),
			},
		} )
	);
};
