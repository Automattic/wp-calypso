import { createElement } from 'react';
import { Subscribers } from './main';

export function subscribers( context, next ) {
	context.primary = createElement( Subscribers );
	next();
}
