import { getPlaceholderSiteID } from '@automattic/data-stores/src/site/constants';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { getPatternCategorySlugs } from 'calypso/my-sites/patterns/controller';
import { getPatternCategoriesQueryOptions } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/hooks/use-patterns';
import PatternsSSR from 'calypso/my-sites/patterns/patterns-ssr';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';
import type {
	Category,
	Pattern,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

type Next = ( error?: Error ) => void;

function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = (
		<PatternsSSR category={ context.params.category } isGridView={ !! context.query.grid } />
	);

	next();
}

type Context = PageJSContext & {
	cachedMarkup?: string;
	queryClient: QueryClient;
};

function fetchPatterns( context: Context, next: Next ) {
	const { cachedMarkup, queryClient, lang, params, store } = context;

	if ( cachedMarkup ) {
		next();
		return;
	}

	const rendererSiteId = getPlaceholderSiteID();
	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	const categoryPromise = queryClient.fetchQuery< Category[] >(
		getPatternCategoriesQueryOptions( locale, Number( rendererSiteId ), {
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
