import { createElement } from 'react';
import PrivacyComponent from 'calypso/me/privacy/main';

export function privacy( context, next ) {
	context.primary = createElement( PrivacyComponent );
	next();
}
