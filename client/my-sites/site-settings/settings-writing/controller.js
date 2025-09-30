import { createElement } from 'react';
import WritingMain from 'calypso/my-sites/site-settings/settings-writing/main';

export function writing( context, next ) {
	context.primary = createElement( WritingMain );
	next();
}
