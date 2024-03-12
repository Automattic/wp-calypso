import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
	notFound,
} from 'calypso/controller/index.web';
import { CategoryGalleryClient } from 'calypso/my-sites/patterns/components/category-gallery/client';
import { PatternGalleryClient } from 'calypso/my-sites/patterns/components/pattern-gallery/client';
import {
	PatternTypeFilter,
	type RouterContext,
	type RouterNext,
} from 'calypso/my-sites/patterns/types';
import { PatternsWrapper } from 'calypso/my-sites/patterns/wrapper';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getPatternCategoriesQueryOptions } from './hooks/use-pattern-categories';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	if ( ! context.primary ) {
		context.primary = (
			<PatternsWrapper
				category={ context.params.category }
				categoryGallery={ CategoryGalleryClient }
				isGridView={ !! context.query.grid }
				patternGallery={ PatternGalleryClient }
				patternType={
					context.params.type === 'layouts' ? PatternTypeFilter.PAGES : PatternTypeFilter.REGULAR
				}
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
	router(
		`/${ langParam }/patterns/:type(layouts)/:category?`,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		...middleware
	);

	router( `/patterns/:category?`, ...middleware );
	router( `/patterns/:type(layouts)/:category?`, ...middleware );
}
