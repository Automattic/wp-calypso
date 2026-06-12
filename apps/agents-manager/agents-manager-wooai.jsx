/**
 * WooAI connected variant entry point.
 *
 * This variant is used when:
 * - We're in the WooCommerce AI admin environment
 * - Jetpack is connected
 *
 * WooAI renders the Agents Manager chat UI in its own container,
 * without touching the admin bar or Site Hub.
 */

import { useImageUpload } from '@automattic/agents-manager';
import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';

const container = document.createElement( 'div' );
container.id = 'agents-manager-root';

const renderAssistant = () => {
	createRoot( container ).render( <AgentsManagerWithProvider useImageUpload={ useImageUpload } /> );
};

if ( document.body ) {
	document.body.appendChild( container );
	renderAssistant();
} else {
	const observer = new window.MutationObserver( ( _, obs ) => {
		if ( document.body ) {
			document.body.appendChild( container );
			renderAssistant();
			obs.disconnect();
		}
	} );
	observer.observe( document.documentElement, { childList: true } );
}
