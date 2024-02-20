import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { startsWith } from 'lodash';
import {
	makeLayout,
	redirectLoggedOutToSignup,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
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
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();

	page( '/tag/*', redirectHashtaggedTags );

	page( `/${ anyLangParam }/tag/:tag`, redirectInvalidLanguage );

	if ( isReaderTagEmbedPage( window.location ) ) {
		page(
			[ '/tag/:tag', `/${ langParam }/tag/:tag` ],
			setLocaleMiddleware(),
			redirectToSignup,
			updateLastRoute,
			tagListing,
			makeLayout,
			clientRender
		);
		return;
	}

	page(
		[ '/tag/:tag', `/${ langParam }/tag/:tag` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		redirectToSignup,
		updateLastRoute,
		sidebar,
		tagListing,
		makeLayout,
		clientRender
	);
}
