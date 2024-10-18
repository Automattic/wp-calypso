import { createRoot, hydrateRoot } from 'react-dom/client';

export function render( context ) {
	createRoot( document.getElementById( 'wpcom' ) ).render( context.layout );
}

export function hydrate( context ) {
	hydrateRoot( document.getElementById( 'wpcom' ), context.layout );
}
