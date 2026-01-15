import { createRoot } from 'react-dom/client';
import AgentsManagerWithProvider from './agents-manager-with-provider';

const target = document.getElementById( 'agents-manager-masterbar' );

if ( target ) {
	createRoot( target ).render( <AgentsManagerWithProvider /> );
}
