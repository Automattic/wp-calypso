import { hydrateRoot } from 'react-dom/client';
import { getRootNode, setRootNode, getRootDomElement } from 'calypso/boot/common';

export function render( context ) {
	getRootNode().render( context.layout );
}

export function hydrate( context ) {
	setRootNode( hydrateRoot( getRootDomElement(), context.layout ) );
}
