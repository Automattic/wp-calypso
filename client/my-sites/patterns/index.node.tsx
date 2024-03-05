import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale, notFound } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import { PatternsHomePage } from 'calypso/my-sites/patterns/home';
import { getPatternCategoriesQueryOptions } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { RouterContext, RouterNext, Category, Pattern } from 'calypso/my-sites/patterns/types';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	context.primary = (
		<PatternsHomePage
			category={ context.params.category }
			isGridView={ !! context.query.grid }
			patternGallery={ PatternGalleryServer }
		/>
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

	// Always fetch list of categories
	queryClient
		.fetchQuery< Category[] >(
			getPatternCategoriesQueryOptions( locale, {
				staleTime: 10 * 60 * 1000,
			} )
		)
		.then( ( categories ) => {
			// Fetch patterns only if the user is requesting a category page
			if ( params.category ) {
				const categoryNames = categories.map( ( category ) => category.name );

				if ( ! categoryNames.includes( params.category ) ) {
					notFound( context, next );
					return;
				}

				return queryClient.fetchQuery< Pattern[] >(
					getPatternsQueryOptions( locale, params.category, { staleTime: 10 * 60 * 1000 } )
				);
			}
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
		fetchPatterns,
		renderPatterns,
		makeLayout
	);
}
