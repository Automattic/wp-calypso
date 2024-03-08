import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
	notFound,
} from 'calypso/controller/index.web';
import { PatternGalleryClient } from 'calypso/my-sites/patterns/components/pattern-gallery/client';
import { PatternsIndex } from 'calypso/my-sites/patterns/index';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getPatternCategoriesQueryOptions } from './hooks/use-pattern-categories';
import type { RouterContext, RouterNext } from 'calypso/my-sites/patterns/types';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	if ( ! context.primary ) {
		context.primary = (
			<PatternsIndex
				category={ context.params.category }
				isGridView={ !! context.query.grid }
				patternGallery={ PatternGalleryClient }
			/>
		);
	}

	next();
}

function checkCategorySlug( context: RouterContext, next: RouterNext ) {
	const { queryClient, lang, params, store } = context;
	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	queryClient
		.fetchQuery( getPatternCategoriesQueryOptions( locale ) )
		.then( ( categories ) => {
			if ( params.category ) {
				const categoryNames = categories.map( ( category ) => category.name );

				if ( ! categoryNames.includes( params.category ) ) {
					notFound( context, next );
					return;
				}
			}

			next();
		} )
		.catch( ( error ) => {
			next( error );
		} );
}

export default function ( router: typeof clientRouter ) {
	const langParam = getLanguageRouteParam();
	const middleware = [ checkCategorySlug, renderPatterns, makeLayout, clientRender ];

	router(
		`/${ langParam }/patterns/:category?`,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		...middleware
	);
	router( `/patterns/:category?`, ...middleware );
}
