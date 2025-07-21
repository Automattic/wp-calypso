import { createRoot, hydrateRoot } from 'react-dom/client';

// Store the root instances to reuse them across renders
let rootInstance = null;
let hydrateRootInstance = null;

export function render( context ) {
	// Reuse the existing root if available, otherwise create a new one
	if ( ! rootInstance ) {
		rootInstance = createRoot( document.getElementById( 'wpcom' ) );
	}

	rootInstance.render( context.layout );
}

export function hydrate( context ) {
	// Reuse the existing hydrate root if available, otherwise create a new one
	if ( ! hydrateRootInstance ) {
		hydrateRootInstance = hydrateRoot( document.getElementById( 'wpcom' ), context.layout );
	} else {
		// For subsequent calls, use the update method on the existing instance
		hydrateRootInstance.render( context.layout );
	}
}
