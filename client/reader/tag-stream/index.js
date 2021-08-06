import { startsWith } from 'lodash';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { tagListing } from './controller';

const redirectHashtaggedTags = ( context, next ) => {
	if ( context.hashstring && startsWith( context.pathname, '/tag/#' ) ) {
		page.redirect( `/tag/${ context.hashstring }` );
	}
	next();
};

export default function () {
	page( '/tag/*', redirectHashtaggedTags );
	page( '/tag/:tag', updateLastRoute, sidebar, tagListing, makeLayout, clientRender );
}
