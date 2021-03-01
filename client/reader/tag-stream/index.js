/**
 * External dependencies
 */
import page from 'page';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { tagListing } from './controller';
import { initAbTests, sidebar, updateLastRoute } from 'calypso/reader/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

const redirectHashtaggedTags = ( context, next ) => {
	if ( context.hashstring && startsWith( context.pathname, '/tag/#' ) ) {
		page.redirect( `/tag/${ context.hashstring }` );
	}
	next();
};

export default function () {
	page( '/tag/*', redirectHashtaggedTags, initAbTests );
	page( '/tag/:tag', updateLastRoute, sidebar, tagListing, makeLayout, clientRender );
}
