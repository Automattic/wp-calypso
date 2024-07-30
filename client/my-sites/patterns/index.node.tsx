import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import {
	excludeSearchFromCanonicalUrlAndHrefLangLinks,
	setHrefLangLinks,
	setLocalizedCanonicalUrl,
} from 'calypso/controller/localized-links';
import { CategoryGalleryServer } from 'calypso/my-sites/patterns/components/category-gallery/server';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import { PatternLibrary } from 'calypso/my-sites/patterns/components/pattern-library';
import { ReadymadeTemplateDetails } from 'calypso/my-sites/patterns/components/readymade-template-details';
import { ReadymadeTemplatesSection } from 'calypso/my-sites/patterns/components/readymade-templates/section';
import { PatternsContext } from 'calypso/my-sites/patterns/context';
import { getPatternCategoriesQueryOptions } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { QUERY_PARAM_SEARCH } from 'calypso/my-sites/patterns/lib/filter-patterns-by-term';
import {
	PatternTypeFilter,
	type RouterContext,
	type RouterNext,
	type Pattern,
} from 'calypso/my-sites/patterns/types';
import { PatternsWrapper } from 'calypso/my-sites/patterns/wrapper';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import performanceMark from 'calypso/server/lib/performance-mark';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	performanceMark( context, 'renderPatterns' );

	context.primary = (
		<PatternsContext.Provider
			value={ {
				category: context.params.category ?? '',
				isGridView: !! context.query.grid,
				section: context.hashstring,
				patternTypeFilter:
					context.params.type === 'layouts' ? PatternTypeFilter.PAGES : PatternTypeFilter.REGULAR,
				searchTerm: context.query[ QUERY_PARAM_SEARCH ] ?? '',
			} }
		>
			<PatternsWrapper>
				<PatternLibrary
					categoryGallery={ CategoryGalleryServer }
					patternGallery={ PatternGalleryServer }
					readymadeTemplates={ ReadymadeTemplatesSection }
				/>
			</PatternsWrapper>
		</PatternsContext.Provider>
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
		.fetchQuery( getPatternCategoriesQueryOptions( locale ) )
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
				getPatternsQueryOptions( locale, params.category )
			);
		} )
		.then( () => {
			next();
		} )
		.catch( ( error ) => {
			next( error );
		} );
}

function renderReadymadeTemplateDetails( context: RouterContext, next: RouterNext ) {
	performanceMark( context, 'renderReadymadeTemplateDetails' );

	context.primary = (
		<PatternsWrapper>
			<ReadymadeTemplateDetails id={ parseInt( context.params.id ) } />
		</PatternsWrapper>
	);

	next();
}

export default function ( router: ReturnType< typeof serverRouter > ) {
	const langParam = getLanguageRouteParam();

	router(
		[
			`/${ langParam }/patterns/:category?`,
			`/${ langParam }/patterns/:type(layouts)/:category?`,
			`/patterns/:category?`,
			`/patterns/:type(layouts)/:category?`,
		],
		ssrSetupLocale,
		excludeSearchFromCanonicalUrlAndHrefLangLinks,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		fetchCategoriesAndPatterns,
		renderPatterns,
		makeLayout
	);

	router(
		[ '/patterns/:type(site-layouts)/:id' ],
		ssrSetupLocale,
		excludeSearchFromCanonicalUrlAndHrefLangLinks,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		renderReadymadeTemplateDetails,
		makeLayout
	);
}
