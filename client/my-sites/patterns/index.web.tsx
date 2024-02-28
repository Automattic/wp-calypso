import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller/index.web';
import Patterns from 'calypso/my-sites/patterns/patterns';
import type { Context as PageJSContext } from '@automattic/calypso-router';

type Next = ( error?: Error ) => void;

function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = (
		<Patterns category={ context.params.category } isGridView={ !! context.query.grid } />
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
	router( '/patterns/:category?', ...middleware );
}
