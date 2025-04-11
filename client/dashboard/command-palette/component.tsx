/**
 * Dashboard Command Palette component
 * Integrated with TanStack Router for navigation
 */
import { useRouter } from '@tanstack/react-router';
import { CommandMenu, store as commandsStore } from '@wordpress/commands';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as keyboardShortcutsStore, useShortcut } from '@wordpress/keyboard-shortcuts';
import { useEffect } from 'react';
import { registerNavigationCommands, unregisterDashboardCommands } from './commands';

// Import WordPress core styles
import '@wordpress/commands/build-style/style.css';

/**
 * Command palette component with shortcut support
 * Uses TanStack Router for navigation
 */
export default function DashboardCommandPalette() {
	const { open } = useDispatch( commandsStore );
	const { registerShortcut } = useDispatch( keyboardShortcutsStore );
	const router = useRouter();

	// Register commands on mount, unregister on unmount
	useEffect( () => {
		registerNavigationCommands( router );
		return () => {
			unregisterDashboardCommands();
		};
	}, [ router ] );

	// Register keyboard shortcut
	useEffect( () => {
		registerShortcut( {
			name: 'dashboard/command-palette',
			category: 'global',
			description: __( 'Open the dashboard command palette.' ),
			keyCombination: {
				modifier: 'primary',
				character: 'k',
			},
		} );
	}, [ registerShortcut ] );

	// Bind shortcut to handler
	useShortcut(
		'dashboard/command-palette',
		( event ) => {
			if ( event.defaultPrevented ) {
				return;
			}
			event.preventDefault();
			open();
		},
		{ bindGlobal: true }
	);

	return <CommandMenu search="" />;
}
