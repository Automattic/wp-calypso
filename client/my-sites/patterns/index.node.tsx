import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { RENDERER_SITE_ID, getPatternCategorySlugs } from 'calypso/my-sites/patterns/controller';
import { getPatternCategoriesQueryOptions } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/hooks/use-patterns';
import PatternsSSR from 'calypso/my-sites/patterns/patterns-ssr';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { RouterContext, RouterNext, Category, Pattern } from 'calypso/my-sites/patterns/types';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	context.primary = (
		<PatternsSSR category={ context.params.category } isGridView={ !! context.query.grid } />
	);

	next();
}

function fetchPatterns( context: RouterContext, next: RouterNext ) {
	const { cachedMarkup, queryClient, lang, params, store } = context;

	if ( cachedMarkup ) {
		next();
		return;
	}

	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	const categoryPromise = queryClient.fetchQuery< Category[] >(
		getPatternCategoriesQueryOptions( locale, RENDERER_SITE_ID, {
			staleTime: 10 * 60 * 1000,
		} )
	);

	const patternPromise = params.category
		? queryClient.fetchQuery< Pattern[] >(
				getPatternsQueryOptions( locale, params.category, { staleTime: 10 * 60 * 1000 } )
		  )
		: Promise.resolve();

	Promise.all( [ categoryPromise, patternPromise ] )
		.then( () => {
			next();
		} )
		.catch( ( error ) => {
			next( error );
		} );
}

export default function ( router: ReturnType< typeof serverRouter > ) {
	const langParam = getLanguageRouteParam();
	const categorySlugs = getPatternCategorySlugs();

	router(
		[
			`/${ langParam }/patterns/:category(${ categorySlugs })?`,
			`/patterns/:category(${ categorySlugs })?`,
		],
		ssrSetupLocale,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		fetchPatterns,
		renderPatterns,
		makeLayout
	);
}
