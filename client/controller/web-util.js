import { createRoot, hydrateRoot } from 'react-dom/client';
import { withNavigationComplete } from 'calypso/lib/bilmur-spa/main-app';

// The classic Calypso app mounts into a single, long-lived `#wpcom` container.
// `createRoot`/`hydrateRoot` must be called exactly once per container; every
// subsequent route navigation reuses the same root via `root.render()`. (The
// legacy `ReactDOM.render`/`hydrate` APIs were idempotent per container, so the
// previous implementation could call them on every navigation.)
let root;

function getLayout( context ) {
	return withNavigationComplete( context.layout, context.bilmurNavigationKey );
}

export function render( context ) {
	if ( ! root ) {
		root = createRoot( document.getElementById( 'wpcom' ) );
	}
	root.render( getLayout( context ) );
}

export function hydrate( context ) {
	if ( ! root ) {
		root = hydrateRoot( document.getElementById( 'wpcom' ), getLayout( context ) );
	} else {
		root.render( getLayout( context ) );
	}
}
