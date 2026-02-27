/**
 * CIAB (Commerce in a Box) connected variant entry point.
 *
 * This variant is used when:
 * - We're in the CIAB admin environment (Next Admin SPA)
 * - Jetpack is connected
 *
 * CIAB doesn't render the classic WordPress admin bar — it uses its own Site Hub.
 * This variant simply mounts the full Agents Manager UI in its own container,
 * without touching the admin bar or Site Hub. Help Center continues to manage
 * its own button in the Site Hub independently.
 */

import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';

const container = document.createElement( 'div' );
container.id = 'agents-manager-root';
document.body.appendChild( container );
createRoot( container ).render( <AgentsManagerWithProvider /> );
