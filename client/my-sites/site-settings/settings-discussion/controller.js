import { createElement } from 'react';
import DiscussionMain from 'calypso/my-sites/site-settings/settings-discussion/main';

export function discussion( context, next ) {
	context.primary = createElement( DiscussionMain );
	next();
}
