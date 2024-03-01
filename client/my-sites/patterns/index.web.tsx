import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller/index.web';
import { getPatternCategorySlugs } from 'calypso/my-sites/patterns/controller';
import Patterns from 'calypso/my-sites/patterns/patterns';
import type { RouterContext, RouterNext } from 'calypso/my-sites/patterns/types';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	context.primary = (
		<Patterns category={ context.params.category } isGridView={ !! context.query.grid } />
	);

	next();
}

export default function ( router: typeof clientRouter ) {
	const langParam = getLanguageRouteParam();
	const categorySlugs = getPatternCategorySlugs();
	const middleware = [ renderPatterns, makeLayout, clientRender ];

	router(
		`/${ langParam }/patterns/:category(${ categorySlugs })?`,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		...middleware
	);
	router( `/patterns/:category(${ categorySlugs })?`, ...middleware );
}
