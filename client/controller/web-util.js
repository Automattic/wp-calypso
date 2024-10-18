import { hydrateRoot } from 'react-dom/client';
import { getRootNode, getRootDomElement } from 'calypso/boot/common';

export function render( context ) {
	getRootNode().render( context.layout );
}

export function hydrate( context ) {
	hydrateRoot( getRootDomElement(), context.layout );
}
