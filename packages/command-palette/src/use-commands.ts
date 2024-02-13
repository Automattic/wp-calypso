import { recordTracksEvent } from '@automattic/calypso-analytics';
import { home as dashboardIcon, wordpress as wordpressIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { Command, CommandCallBackParams } from './use-command-palette';

interface useCommandNavigationOptions {
	navigate: ( path: string, openInNewTab: boolean ) => void;
}

export interface useCommandsParams {
	setSelectedCommandName: ( name: string ) => void;
	navigate: ( path: string, openInNewTab: boolean ) => void;
}

function useCommandNavigation( { navigate }: useCommandNavigationOptions ) {
	// TODO: Find an alternative way to use the current route.
	//const currentRoute = useSelector( getCurrentRoutePattern );
	const currentRoute = window.location.pathname;
	// Callback to navigate to a command's destination
	// used on command callback or siteFunctions onClick
	const commandNavigation = useCallback(
		( url: string, { openInNewTab = false } = {} ) =>
			( { close, command }: Pick< CommandCallBackParams, 'close' | 'command' > ) => {
				recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
					command: command.name,
					current_route: currentRoute,
					is_wp_admin: url.includes( '/wp-admin' ),
				} );
				close();
				navigate( url, openInNewTab );
			},
		[ navigate, currentRoute ]
	);
	return commandNavigation;
}

export const useCommands = ( { setSelectedCommandName, navigate }: useCommandsParams ) => {
	const { __, _x } = useI18n();
	const setStateCallback =
		( actionName: string, placeholder: string = __( 'Select a site', __i18n_text_domain__ ) ) =>
		( { setSearch, setPlaceholderOverride }: CommandCallBackParams ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
			setPlaceholderOverride( placeholder );
		};

	const commandNavigation = useCommandNavigation( { navigate } );

	const commands: Command[] = [
		{
			name: 'viewMySites',
			label: __( 'View my sites', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'view my sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
				_x( 'manage sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
				_x( 'sites dashboard', 'Keyword for the View my sites command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( `/sites` ),
			icon: wordpressIcon,
		},
		{
			name: 'openSiteDashboard',
			label: __( 'Open site dashboard', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open site dashboard',
					'Keyword for the Open site dashboard command',
					__i18n_text_domain__
				),
				_x( 'admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
				_x( 'wp-admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback(
				'openSiteDashboard',
				__( 'Select site to open dashboard', __i18n_text_domain__ )
			),
			siteFunctions: {
				onClick: ( param ) => commandNavigation( `/home/${ param.site.slug }` )( param ),
			},
			icon: dashboardIcon,
		},
	];

	return commands;
};
