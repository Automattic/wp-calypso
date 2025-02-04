import page from '@automattic/calypso-router';
import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { fetchTrendingTags } from '../tags/controller';
import { search } from './controller';

const fetchTrendingTagsIfLoggedOut = ( context, next ) => {
	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		return fetchTrendingTags( context, next );
	}
	next();
};

export default function () {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	// Old recommendations page
	page( '/recommendations', '/reader/search' );
	// Invalid language
	page( `/${ anyLangParam }/reader/search/`, redirectInvalidLanguage );

	page(
		[ '/reader/search', `/${ langParam }/reader/search` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		fetchTrendingTagsIfLoggedOut,
		updateLastRoute,
		sidebar,
		search,
		makeLayout,
		clientRender
	);
}
