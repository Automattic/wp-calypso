/**
 * Dashboard commands and registration
 *
 * This file contains command definitions and registration functions
 */
import { store as commandsStore } from '@wordpress/commands';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { globe, commentAuthorAvatar, envelope, bell, wordpress, home } from '@wordpress/icons';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import type { AppConfig } from '../app/context';
import type { Router } from '@tanstack/react-router';

/**
 * Command definition with feature flag
 */
export interface Command {
	name: string;
	label: string;
	searchLabel: string;
	path: string;
	icon: React.ReactNode;
	// Optional feature flag that controls when command is available
	feature?: keyof AppConfig[ 'supports' ];
}

/**
 * Navigation commands for the dashboard
 */
export const navigationCommands: Command[] = [
	{
		name: 'dashboard-go-to-overview',
		label: __( 'Go to Overview' ),
		searchLabel: __( 'Navigate to Dashboard Overview page' ),
		path: '/overview',
		icon: home,
		feature: 'overview',
	},
	{
		name: 'dashboard-go-to-sites',
		label: __( 'Go to Sites' ),
		searchLabel: __( 'Navigate to Sites dashboard Sites page' ),
		path: '/sites',
		icon: wordpress,
		feature: 'sites',
	},
	{
		name: 'dashboard-go-to-emails',
		label: __( 'Go to Emails' ),
		searchLabel: __( 'Navigate to Email management Email inbox' ),
		path: '/emails',
		icon: envelope,
		feature: 'emails',
	},
	{
		name: 'dashboard-go-to-domains',
		label: __( 'Go to Domains' ),
		searchLabel: __( 'Navigate to Domain management Domains list' ),
		path: '/domains',
		icon: globe,
		feature: 'domains',
	},
	{
		name: 'dashboard-go-to-profile',
		label: __( 'Go to Profile' ),
		searchLabel: __( 'Navigate to User profile settings account' ),
		path: '/me/profile',
		icon: commentAuthorAvatar,
		feature: 'me',
	},
	{
		name: 'dashboard-go-to-reader',
		label: __( 'Go to Reader' ),
		searchLabel: __( 'Navigate to WordPress Reader blogs posts' ),
		path: '/reader',
		icon: <ReaderIcon />,
		feature: 'reader',
	},
	{
		name: 'dashboard-go-to-notifications',
		label: __( 'Go to Notifications' ),
		searchLabel: __( 'Check your WordPress notifications alerts' ),
		path: '/me/notifications',
		icon: bell,
		feature: 'notifications',
	},
];

/**
 * Register navigation commands based on app context and feature flags
 *
 * @param router The TanStack Router instance from the useRouter hook
 * @param appConfig The application configuration with feature flags
 */
export function registerNavigationCommands( router: Router, appConfig: AppConfig ) {
	const { registerCommand } = dispatch( commandsStore );

	// Filter commands based on feature flags from app context
	const enabledCommands = navigationCommands.filter( ( cmd ) => {
		// If no feature is specified, command is always enabled
		if ( ! cmd.feature ) {
			return true;
		}
		// Otherwise, check if the feature is enabled in the app context
		return appConfig.supports[ cmd.feature ];
	} );

	// Register enabled commands
	enabledCommands.forEach( ( cmd ) => {
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
