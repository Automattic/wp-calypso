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

import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';

const container = document.createElement( 'div' );
container.id = 'agents-manager-root';
document.body.appendChild( container );
createRoot( container ).render( <AgentsManagerWithProvider /> );
