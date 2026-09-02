import page from '@automattic/calypso-router';
import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { redirectLoggedOutToDiscover, sidebar } from 'calypso/reader/controller';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import { tagListing } from './controller';

const redirectHashtaggedTags = ( context, next ) => {
	if ( context.hashstring && ( context.pathname ?? '' ).startsWith( '/tag/#' ) ) {
		page.redirect( `/tag/${ context.hashstring }` );
	}
	next();
};

export default function () {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();

	page( '/tag/*', redirectHashtaggedTags );

	page( `/${ anyLangParam }/tag/:tag`, redirectInvalidLanguage );

	page(
		[ '/tag/:tag', `/${ langParam }/tag/:tag` ],
		redirectLoggedOutToDiscover,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		sidebar,
		tagListing,
		makeLayout,
		clientRender
	);

	// Catch-all for unrecognized /tag/* paths (after the specific /tag/:tag route).
	page( '/tag/*', readerNotFound );
}
