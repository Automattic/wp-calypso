import config from '@automattic/calypso-config';
import { startsWith } from 'lodash';
import page from 'page';
import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { tagListing } from './controller';

const redirectHashtaggedTags = ( context, next ) => {
	if ( context.hashstring && startsWith( context.pathname, '/tag/#' ) ) {
		page.redirect( `/tag/${ context.hashstring }` );
	}
	next();
};

const redirectToSignup = ( context, next ) => {
	if ( ! config.isEnabled( 'reader/public-tag-pages' ) ) {
		return redirectLoggedOutToSignup( context, next );
	}
	return next();
};

export default function () {
	page( '/tag/*', redirectHashtaggedTags );
	page(
		'/tag/:tag',
		redirectToSignup,
		updateLastRoute,
		sidebar,
		tagListing,
		makeLayout,
		clientRender
	);
}
