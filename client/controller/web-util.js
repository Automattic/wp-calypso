import { hydrateRoot } from 'react-dom/client';

export function render( context ) {
	context.root.render( context.layout );
}

export function hydrate( context ) {
	hydrateRoot( document.getElementById( 'wpcom' ), context.layout );
}
