import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';
import HeadlessAgentWithProvider from './headless-agent-with-provider';

const masterbarTarget = document.getElementById( 'agents-manager-masterbar' );

if ( masterbarTarget ) {
	// Full UI mode: render Agents Manager dock in the masterbar
	createRoot( masterbarTarget ).render( <AgentsManagerWithProvider /> );
} else {
	// Headless mode: just initialize the agent without UI
	// This allows other components (like Image Studio) to use the shared agent
	const headlessContainer = document.createElement( 'div' );
	headlessContainer.id = 'agents-manager-headless';
	headlessContainer.style.display = 'none';
	document.body.appendChild( headlessContainer );
	createRoot( headlessContainer ).render( <HeadlessAgentWithProvider /> );
}
