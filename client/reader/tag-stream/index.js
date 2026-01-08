import page from '@automattic/calypso-router';
import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { startsWith } from 'lodash';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { tagListing } from './controller';

const redirectHashtaggedTags = ( context, next ) => {
	if ( context.hashstring && startsWith( context.pathname, '/tag/#' ) ) {
		page.redirect( `/tag/${ context.hashstring }` );
	}
	next();
};

export default function () {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();

	page( '/tag/*', setBeforePrimary, redirectHashtaggedTags );

	page( `/${ anyLangParam }/tag/:tag`, setBeforePrimary, redirectInvalidLanguage );

	if ( isReaderTagEmbedPage( window.location ) ) {
		page(
			[ '/tag/:tag', `/${ langParam }/tag/:tag` ],
			setBeforePrimary,
			setLocaleMiddleware(),
			tagListing,
			makeLayout,
			clientRender
		);
		return;
	}

	page(
		[ '/tag/:tag', `/${ langParam }/tag/:tag` ],
		setBeforePrimary,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		sidebar,
		tagListing,
		makeLayout,
		clientRender
	);
}
