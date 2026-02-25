/* global agentsManagerData */
import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';
import HeadlessAgentWithProvider from './headless-agent-with-provider';

const masterbarTarget = document.getElementById( 'agents-manager-masterbar' );

if ( masterbarTarget ) {
	// Full UI mode: render Agents Manager in the admin bar masterbar node
	createRoot( masterbarTarget ).render( <AgentsManagerWithProvider /> );
} else if ( agentsManagerData?.useUnifiedExperience ) {
	// Unified experience without admin bar: create own container and render full UI.
	// This covers environments like CIAB that enable the unified experience
	// but don't render the WordPress admin bar.
	const container = document.createElement( 'div' );
	container.id = 'agents-manager-root';
	document.body.appendChild( container );
	createRoot( container ).render( <AgentsManagerWithProvider /> );
} else {
	// Headless mode: just initialize the agent without UI
	// This allows other components (like Image Studio) to use the shared agent
	const headlessContainer = document.createElement( 'div' );
	headlessContainer.id = 'agents-manager-headless';
	headlessContainer.style.display = 'none';
	document.body.appendChild( headlessContainer );
	createRoot( headlessContainer ).render( <HeadlessAgentWithProvider /> );
}
