import { createElement } from 'react';
import LegacyContactComponent from 'calypso/me/legacy-contact/main';

export function legacyContact( context, next ) {
	context.primary = createElement( LegacyContactComponent );
	next();
}
