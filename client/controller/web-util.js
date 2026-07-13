import { createRoot, hydrateRoot } from 'react-dom/client';

// The classic Calypso app mounts into a single, long-lived `#wpcom` container.
// `createRoot`/`hydrateRoot` must be called exactly once per container; every
// subsequent route navigation reuses the same root via `root.render()`. (The
// legacy `ReactDOM.render`/`hydrate` APIs were idempotent per container, so the
// previous implementation could call them on every navigation.)
let root;

export function render( context ) {
	if ( ! root ) {
		root = createRoot( document.getElementById( 'wpcom' ) );
	}
	root.render( context.layout );
}

export function hydrate( context ) {
	if ( ! root ) {
		root = hydrateRoot( document.getElementById( 'wpcom' ), context.layout );
	} else {
		root.render( context.layout );
	}
}
