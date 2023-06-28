import { createElement } from 'react';
import DomainsComponent from 'calypso/me/domains/main';

export function domains( context, next ) {
	context.primary = createElement( DomainsComponent );
	next();
}
