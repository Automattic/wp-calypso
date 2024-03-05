import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller/index.web';
import { PatternGalleryClient } from 'calypso/my-sites/patterns/components/pattern-gallery/client';
import { PatternsHomePage } from 'calypso/my-sites/patterns/home';
import type { RouterContext, RouterNext } from 'calypso/my-sites/patterns/types';

function renderPatterns( context: RouterContext, next: RouterNext ) {
	context.primary = (
		<PatternsHomePage
			category={ context.params.category }
			isGridView={ !! context.query.grid }
			patternGallery={ PatternGalleryClient }
		/>
	);

	next();
}

export default function ( router: typeof clientRouter ) {
	const langParam = getLanguageRouteParam();
	const middleware = [ renderPatterns, makeLayout, clientRender ];

	router(
		`/${ langParam }/patterns/:category?`,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		...middleware
	);
	router( `/patterns/:category?`, ...middleware );
}
