/**
 * Dashboard Command Palette component
 * Integrated with TanStack Router for navigation
 */
import { useRouter } from '@tanstack/react-router';
import { CommandMenu } from '@wordpress/commands';
import { useEffect } from 'react';
import { useAppContext } from '../app/context';
import { registerNavigationCommands, unregisterDashboardCommands } from './commands';

// Import WordPress core styles
import '@wordpress/commands/build-style/style.css';

/**
 * Command palette component with shortcut support
 * Uses TanStack Router for navigation
 */
export default function DashboardCommandPalette() {
	const router = useRouter();
	const appContext = useAppContext();

	// Register commands on mount, unregister on unmount
	useEffect( () => {
		// Pass both router and app context for conditional command registration
		registerNavigationCommands( router, appContext );
		return () => {
			unregisterDashboardCommands();
		};
	}, [ router, appContext ] );

	return <CommandMenu search="" />;
}
