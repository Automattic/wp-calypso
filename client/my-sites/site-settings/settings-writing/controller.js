import { createElement } from 'react';
import WritingMain from 'calypso/my-sites/site-settings/settings-writing/main';
import Taxonomies from 'calypso/my-sites/site-settings/taxonomies';

export function writing( context, next ) {
	context.primary = createElement( WritingMain );
	next();
}

export function taxonomies( context, next ) {
	context.primary = createElement( Taxonomies, {
		taxonomy: context.params.taxonomy,
		postType: 'post',
	} );
	next();
}
