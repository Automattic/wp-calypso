import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import { getPatternCategoriesQueryOptions } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { PatternsWrapper } from 'calypso/my-sites/patterns/wrapper';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import performanceMark from 'calypso/server/lib/performance-mark';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { RouterContext, RouterNext, Pattern } from 'calypso/my-sites/patterns/types';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	performanceMark( context, 'renderPatterns' );

	context.primary = (
		<PatternsWrapper
			category={ context.params.category }
			isGridView={ !! context.query.grid }
			patternGallery={ PatternGalleryServer }
		/>
	);

	next();
}

function fetchCategoriesAndPatterns( context: RouterContext, next: RouterNext ) {
	performanceMark( context, 'fetchCategoriesAndPatterns' );

	const { cachedMarkup, queryClient, lang, params, store } = context;

	// Bypasses fetching if the rendered page is cached, or if any query parameters were passed in the URL
	if ( cachedMarkup || Object.keys( context.query ).length > 0 ) {
		next();

		return;
	}

	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	performanceMark( context, 'getPatternCategories', true );

	// Fetches the list of categories first, then fetches patterns if a specific category was requested
	queryClient
		.fetchQuery(
			getPatternCategoriesQueryOptions( locale, {
				staleTime: 10 * 60 * 1000,
			} )
		)
		.then( ( categories ) => {
			if ( ! params.category ) {
				return;
			}

			const categoryNames = categories.map( ( category ) => category.name );

			if ( ! categoryNames.includes( params.category ) ) {
				throw {
					status: 404,
					message: 'Category Not Found',
				};
			}

			performanceMark( context, 'getPatterns', true );

			return queryClient.fetchQuery< Pattern[] >(
				getPatternsQueryOptions( locale, params.category, { staleTime: 10 * 60 * 1000 } )
			);
		} )
		.then( () => {
			next();
		} )
		.catch( ( error ) => {
			next( error );
		} );
}

export default function ( router: ReturnType< typeof serverRouter > ) {
	const langParam = getLanguageRouteParam();

	router(
		[ `/${ langParam }/patterns/:category?`, `/patterns/:category?` ],
		ssrSetupLocale,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		fetchCategoriesAndPatterns,
		renderPatterns,
		makeLayout
	);
}
