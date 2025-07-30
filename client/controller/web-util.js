import { createRoot, hydrateRoot } from 'react-dom/client';

// Store a single root instance to reuse across renders
let rootInstance = null;

export function render( context ) {
	// Reuse the existing root if available, otherwise create a new one
	if ( ! rootInstance ) {
		rootInstance = createRoot( document.getElementById( 'wpcom' ) );
	}

	rootInstance.render( context.layout );
}

export function hydrate( context ) {
	// For the first call, use hydrateRoot to attach to server-rendered content
	if ( ! rootInstance ) {
		rootInstance = hydrateRoot( document.getElementById( 'wpcom' ), context.layout );
	} else {
		// For subsequent calls, use the render method on the existing instance
		rootInstance.render( context.layout );
	}
}
