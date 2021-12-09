import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import {
	fetchThemeData,
	fetchThemeFilters,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails,
	redirectTiers,
} from './controller';
import { validateFilters, validateVertical } from './validate-filters';

export default function ( router ) {
	// Redirect interim showcase route to permanent one
	router( [ '/design', '/design/*' ], ( { originalUrl, res } ) => {
		res.redirect( 301, '/themes' + originalUrl.slice( '/design'.length ) );
	} );

	const langParam = getLanguageRouteParam();

	const showcaseRoutes = [
		`/${ langParam }/themes/:tier(free|premium)?`,
		`/${ langParam }/themes/:tier(free|premium)?/filter/:filter`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?/filter/:filter`,
	];
	router(
		showcaseRoutes,
		redirectTiers,
		ssrSetupLocale,
		fetchThemeFilters,
		validateVertical,
		validateFilters,
		fetchThemeData,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		loggedOut,
		makeLayout
	);
	router( [ '/themes/upload', '/themes/upload/*' ], makeLayout );
	// Redirect legacy (Atlas-based Theme Showcase v4) routes
	router(
		[
			'/themes/:site?/search/:search',
			'/themes/:site?/type/:tier(free|premium)',
			'/themes/:site?/search/:search/type/:tier(free|premium)',
		],
		redirectTiers,
		redirectSearchAndType
	);
	router(
		[ '/themes/:site?/filter/:filter', '/themes/:site?/filter/:filter/type/:tier(free|premium)' ],
		redirectTiers,
		redirectFilterAndType
	);
	router(
		[ '/themes/:theme/:section(support)?', '/themes/:site/:theme/:section(support)?' ],
		redirectToThemeDetails
	);
	// The following route definition is needed so direct hits on `/themes/<mysite>` don't result in a 404.
	router( '/themes/*', fetchThemeData, loggedOut, makeLayout );
}
