import page from '@automattic/calypso-router';
import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { fetchTrendingTagsIfLoggedOut, search } from '../discover/search-controller';

export default function () {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	// Old recommendations page
	page( '/recommendations', '/reader/search' );
	// Invalid language
	page( `/${ anyLangParam }/reader/search/`, redirectInvalidLanguage );

	readerPage(
		[ '/reader/search', `/${ langParam }/reader/search` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		fetchTrendingTagsIfLoggedOut,
		sidebar,
		search,
		makeLayout,
		clientRender
	);
}
