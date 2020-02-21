/**
 * External dependencies
 */
import page from 'page';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { tagListing } from './controller';
import {
	initAbTests,
	makeLayout,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_TAGS_DEFINITION } from 'reader';

const redirectHashtaggedTags = ( context, next ) => {
	if ( context.hashstring && startsWith( context.pathname, '/tag/#' ) ) {
		page.redirect( `/tag/${ context.hashstring }` );
	}
	next();
};

export default function() {
	page( '/tag/*', preloadReaderBundle, redirectHashtaggedTags, initAbTests );
	page(
		'/tag/:tag',
		updateLastRoute,
		sidebar,
		setSection( READER_TAGS_DEFINITION ),
		tagListing,
		makeLayout,
		clientRender
	);
}
