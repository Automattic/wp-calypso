import { getPlaceholderSiteID } from '@automattic/data-stores/src/site/constants';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale, notFound } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
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

async function fetchPatterns( context: Context, next: Next ): Promise< void > {
	const { cachedMarkup, queryClient, lang, params, store } = context;

	if ( cachedMarkup ) {
		next();
		return;
	}

	const rendererSiteId = getPlaceholderSiteID();
	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	try {
		// Always fetch list of categories
		const categories = await queryClient.fetchQuery< Category[] >(
			getPatternCategoriesQueryOptions( Number( rendererSiteId ), { staleTime: 10 * 60 * 1000 } )
		);

		// Fetch patterns only if the user is requesting a category page
		if ( params.category ) {
			const categoryNames = categories.map( ( category ) => category.name );

			if ( ! categoryNames.includes( params.category ) ) {
				notFound( context, next );
				return;
			}

			await queryClient.fetchQuery< Pattern[] >(
				getPatternsQueryOptions( locale, params.category, { staleTime: 10 * 60 * 1000 } )
			);
		}
	} catch ( error ) {
		next( error as Error );
	}

	next();
}

export default function ( router: ReturnType< typeof serverRouter > ) {
	const langParam = getLanguageRouteParam();

	router(
		[ `/${ langParam }/patterns/:category?`, '/patterns/:category?' ],
		ssrSetupLocale,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		fetchPatterns,
		renderPatterns,
		makeLayout
	);
}
