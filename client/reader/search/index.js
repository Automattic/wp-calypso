import { getLanguageRouteParam } from '@automattic/i18n-utils';
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

export default function () {
	const langParam = getLanguageRouteParam();
	// Old recommendations page
	page( '/recommendations', '/read/search' );

	page(
		[ '/read/search', `/${ langParam }/read/search` ],
		setLocaleMiddleware(),
		fetchTrendingTagsIfLoggedOut,
		updateLastRoute,
		sidebar,
		search,
		makeLayout,
		clientRender
	);
}
