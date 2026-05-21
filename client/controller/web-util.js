import config from '@automattic/calypso-config';
import ReactDom from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';

// Gates the React 18 `createRoot`/`hydrateRoot` adoption. When disabled, the
// `#wpcom` root keeps mounting via the legacy `ReactDOM.render`/`hydrate` APIs
// (React-17 update semantics — synchronous, no automatic batching).
const useCreateRoot = config.isEnabled( 'calypso/react-18-create-root' );

// The classic Calypso app mounts into a single, long-lived `#wpcom` container.
// `createRoot`/`hydrateRoot` must be called exactly once per container; every
// subsequent route navigation reuses the same root via `root.render()`. (The
// legacy `ReactDOM.render`/`hydrate` APIs were idempotent per container, so the
// previous implementation could call them on every navigation.)
let root;

export function render( context ) {
	if ( ! useCreateRoot ) {
		ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
		return;
	}
	if ( ! root ) {
		root = createRoot( document.getElementById( 'wpcom' ) );
	}
	root.render( context.layout );
}

export function hydrate( context ) {
	if ( ! useCreateRoot ) {
		ReactDom.hydrate( context.layout, document.getElementById( 'wpcom' ) );
		return;
	}
	if ( ! root ) {
		root = hydrateRoot( document.getElementById( 'wpcom' ), context.layout );
	} else {
		root.render( context.layout );
	}
}
