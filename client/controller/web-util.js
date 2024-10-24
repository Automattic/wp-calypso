import { createRoot, hydrateRoot } from 'react-dom/client';

export function getRootDomElement() {
	return document.getElementById( 'wpcom' );
}

let wpcomRootNode;

export function render( context ) {
	if ( wpcomRootNode == null ) {
		wpcomRootNode = createRoot( getRootDomElement() );
	}
	wpcomRootNode.render( context.layout );
}

export function hydrate( context ) {
	wpcomRootNode = hydrateRoot( getRootDomElement(), context.layout );
}
