/**
 * WP Admin connected variant entry point.
 *
 * Mounts the Agents Manager dock into the admin bar node. Admin screens with no
 * admin bar (e.g. iframe requests) render no node, so there is nothing to mount.
 */
import './config';
import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';
import JetpackAiSidebarPageGate from './jetpack-ai-sidebar-page-gate';

const masterbarTarget = document.getElementById( 'agents-manager-masterbar' );

if ( masterbarTarget ) {
	createRoot( masterbarTarget ).render(
		<JetpackAiSidebarPageGate>
			<AgentsManagerWithProvider />
		</JetpackAiSidebarPageGate>
	);
}
