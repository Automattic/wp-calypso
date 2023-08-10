import {
	getLanguageRouteParam,
	getAnyLanguageRouteParam,
	removeLocaleFromPathLocaleInFront,
} from '@automattic/i18n-utils';
import page from 'page';
import { makeLayout, redirectInvalidLanguage, render as clientRender } from 'calypso/controller';
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

const redirectLoggedInUrl = ( context, next ) => {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		const pathWithoutLocale = removeLocaleFromPathLocaleInFront( context.path );
		if ( pathWithoutLocale !== context.path ) {
			return page.redirect( pathWithoutLocale );
		}
	}
	next();
};

export default function () {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	// Old recommendations page
	page( '/recommendations', '/read/search' );
	// Invalid language
	page( `/${ anyLangParam }/read/search/`, redirectInvalidLanguage );

	page(
		[ '/read/search', `/${ langParam }/read/search` ],
		redirectLoggedInUrl,
		setLocaleMiddleware(),
		fetchTrendingTagsIfLoggedOut,
		updateLastRoute,
		sidebar,
		search,
		makeLayout,
		clientRender
	);
}
