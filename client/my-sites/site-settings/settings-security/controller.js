import { createElement } from 'react';
import SecurityMain from 'calypso/my-sites/site-settings/settings-security/main';

export function security( context, next ) {
	context.primary = createElement( SecurityMain );
	next();
}
