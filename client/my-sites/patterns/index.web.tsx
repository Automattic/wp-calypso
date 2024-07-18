import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller/index.web';
import { CategoryGalleryClient } from 'calypso/my-sites/patterns/components/category-gallery/client';
import { PatternsCategoryNotFound } from 'calypso/my-sites/patterns/components/category-not-found';
import { PatternGalleryClient } from 'calypso/my-sites/patterns/components/pattern-gallery/client';
import { PatternLibrary } from 'calypso/my-sites/patterns/components/pattern-library';
import { ReadymadeTemplateDetails } from 'calypso/my-sites/patterns/components/readymade-template-details';
import { ReadymadeTemplatesClient } from 'calypso/my-sites/patterns/components/readymade-templates/client';
import { PatternsContext } from 'calypso/my-sites/patterns/context';
import { getPatternCategoriesQueryOptions } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { extractPatternIdFromHash } from 'calypso/my-sites/patterns/lib/extract-pattern-id-from-hash';
import { QUERY_PARAM_SEARCH } from 'calypso/my-sites/patterns/lib/filter-patterns-by-term';
import {
	PatternTypeFilter,
	type RouterContext,
	type RouterNext,
} from 'calypso/my-sites/patterns/types';
import { PatternsWrapper } from 'calypso/my-sites/patterns/wrapper';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

function renderCategoryNotFound( context: RouterContext, next: RouterNext ) {
	context.primary = (
		<PatternsWrapper>
			<PatternsCategoryNotFound />
		</PatternsWrapper>
	);

	next();
}

function renderPatterns( context: RouterContext, next: RouterNext ) {
	if ( ! context.primary ) {
		context.primary = (
			<PatternsContext.Provider
				value={ {
					category: context.params.category ?? '',
					isGridView: !! context.query.grid,
					patternPermalinkId: extractPatternIdFromHash(),
					patternTypeFilter:
						context.params.type === 'layouts' ? PatternTypeFilter.PAGES : PatternTypeFilter.REGULAR,
					referrer: context.query.ref,
					searchTerm: context.query[ QUERY_PARAM_SEARCH ] ?? '',
				} }
			>
				<PatternsWrapper>
					<PatternLibrary
						categoryGallery={ CategoryGalleryClient }
						patternGallery={ PatternGalleryClient }
						readymadeTemplates={ ReadymadeTemplatesClient }
					/>
				</PatternsWrapper>
			</PatternsContext.Provider>
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
					renderCategoryNotFound( context, next );

					return;
				}
			}

			next();
		} )
		.catch( ( error ) => {
			next( error );
		} );
}

function renderReadymadeTemplateDetails( context: RouterContext, next: RouterNext ) {
	if ( ! context.primary ) {
		context.primary = (
			<PatternsWrapper>
				<ReadymadeTemplateDetails id={ parseInt( context.params.id ) } />
			</PatternsWrapper>
		);
	}

	next();
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

	router(
		'/patterns/:type(site-layouts)/:id',
		renderReadymadeTemplateDetails,
		makeLayout,
		clientRender
	);
}
