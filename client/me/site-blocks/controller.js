import { createElement } from 'react';
import SiteBlockListComponent from 'calypso/me/site-blocks/main';

export function siteBlockList( context, next ) {
	context.primary = createElement( SiteBlockListComponent );
	next();
}
