import { createElement } from 'react';
import JetpackMain from 'calypso/my-sites/site-settings/settings-jetpack/main';

export function jetpack( context, next ) {
	context.primary = createElement( JetpackMain );
	next();
}
