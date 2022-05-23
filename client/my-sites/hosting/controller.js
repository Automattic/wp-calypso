import { createElement } from 'react';
import HostingActivate from './hosting-activate';
import Hosting from './main';

export function layout( context, next ) {
	context.primary = createElement( Hosting );
	next();
}

export function activationLayout( context, next ) {
	context.primary = createElement( HostingActivate );
	next();
}
