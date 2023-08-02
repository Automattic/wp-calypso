import {
	getLanguage,
	getLanguageRouteParam,
	removeLocaleFromPathLocaleInFront,
} from '@automattic/i18n-utils';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
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

const redirectInvalidLanguage = ( context, next ) => {
	const langParam = context.params.lang;
	const language = getLanguage( langParam );
	if ( langParam && ! language ) {
		// redirect unsupported language to the default language
		return page.redirect( context.path.replace( `/${ langParam }`, '' ) );
	} else if ( langParam && language.langSlug !== langParam ) {
		// redirect unsupported child language to the parent language
		return page.redirect( context.path.replace( `/${ langParam }`, `/${ language.langSlug }` ) );
	}
	next();
};

export default function () {
	const langParam = getLanguageRouteParam();
	// Old recommendations page
	page( '/recommendations', '/read/search' );
	// Invalid language
	page( `/:lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})/read/search/`, redirectInvalidLanguage );

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
