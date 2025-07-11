import { createRoot, hydrateRoot } from 'react-dom/client';

export function render( context ) {
	const container = document.getElementById( 'wpcom' );
	const root = createRoot( container );
	root.render( context.layout );
}

export function hydrate( context ) {
	const container = document.getElementById( 'wpcom' );
	hydrateRoot( container, context.layout );
}
