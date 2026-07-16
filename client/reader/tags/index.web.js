import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sidebar } from 'calypso/reader/controller';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import { tagsListing, fetchTrendingTags, fetchAlphabeticTags } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		[ '/tags', `/${ langParam }/tags` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		fetchTrendingTags,
		fetchAlphabeticTags,
		sidebar,
		tagsListing,
		makeLayout,
		clientRender
	);

	// Catch-all for unrecognized /tags/* paths.
	page( '/tags/*', readerNotFound );
}
