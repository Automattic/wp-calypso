/**
 * Dashboard commands and registration
 *
 * This file contains command definitions and registration functions
 */
import { store as commandsStore } from '@wordpress/commands';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { globe, home, commentAuthorAvatar, envelope, bell } from '@wordpress/icons';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import type { Router } from '@tanstack/react-router';

/**
 * Navigation commands for the dashboard
 */
export const navigationCommands = [
	{
		name: 'dashboard-go-to-sites',
		label: __( 'Go to Sites' ),
		searchLabel: __( 'Navigate to Sites dashboard Sites page' ),
		path: '/sites',
		icon: home,
	},
	{
		name: 'dashboard-go-to-emails',
		label: __( 'Go to Emails' ),
		searchLabel: __( 'Navigate to Email management Email inbox' ),
		path: '/emails',
		icon: envelope,
	},
	{
		name: 'dashboard-go-to-domains',
		label: __( 'Go to Domains' ),
		searchLabel: __( 'Navigate to Domain management Domains list' ),
		path: '/domains',
		icon: globe,
	},
	{
		name: 'dashboard-go-to-profile',
		label: __( 'Go to Profile' ),
		searchLabel: __( 'Navigate to User profile settings account' ),
		path: '/me/profile',
		icon: commentAuthorAvatar,
	},
	{
		name: 'dashboard-go-to-reader',
		label: __( 'Go to Reader' ),
		searchLabel: __( 'Navigate to WordPress Reader blogs posts' ),
		path: '/reader',
		icon: <ReaderIcon />,
	},
	{
		name: 'dashboard-go-to-notifications',
		label: __( 'Go to Notifications' ),
		searchLabel: __( 'Check your WordPress notifications alerts' ),
		path: '/me/notifications',
		icon: bell,
	},
];

/**
 * Register all dashboard commands with the WordPress commands API
 *
 * @param router The TanStack Router instance from the useRouter hook
 */
export function registerNavigationCommands( router: Router ) {
	const { registerCommand } = dispatch( commandsStore );

	navigationCommands.forEach( ( cmd ) => {
		registerCommand( {
			name: cmd.name,
			label: cmd.label,
			searchLabel: cmd.searchLabel,
			callback: ( { close } ) => {
				// Navigate using absolute path with replace to avoid path concatenation
				router.navigate( {
					to: cmd.path,
					replace: true,
				} );
				close();
			},
			icon: cmd.icon,
			context: 'root',
		} );
	} );
}

/**
 * Unregister all dashboard commands - important for cleanup
 */
export function unregisterDashboardCommands() {
	const { unregisterCommand } = dispatch( commandsStore );

	navigationCommands.forEach( ( cmd ) => {
		unregisterCommand( cmd.name );
	} );
}

/**
 * Utility function to open the command palette directly from anywhere
 */
export function openCommandPalette() {
	const { open } = dispatch( commandsStore );
	if ( open ) {
		open();
	}
}
