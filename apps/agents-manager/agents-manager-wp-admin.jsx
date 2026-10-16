/**
 * WP Admin connected variant entry point.
 *
 * Mounts the Agents Manager dock into the admin bar node. Trusted full-screen
 * iframe requests instead mount the headless editor bridge into a detached node.
 */
import './config';
import { isEmbeddedInFullscreen } from '@automattic/agents-manager/src/utils/embedded-page-protocol';
import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';

const masterbarTarget = document.getElementById( 'agents-manager-masterbar' );

// Headless embedded mode needs React effects but deliberately adds no page UI.
const target =
	masterbarTarget || ( isEmbeddedInFullscreen() ? document.createElement( 'div' ) : null );

if ( target ) {
	createRoot( target ).render( <AgentsManagerWithProvider /> );
}
