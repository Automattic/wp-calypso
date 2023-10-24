import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import {
	fetchThemeData,
	fetchThemeFilters,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails,
} from './controller';
import { renderThemes } from './controller-logged-in';
import { validateFilters, validateVertical } from './validate-filters';

export default function ( router ) {
	// Redirect interim showcase route to permanent one
	router( [ '/design', '/design/*' ], ( { originalUrl, res } ) => {
		res.redirect( 301, '/themes' + originalUrl.slice( '/design'.length ) );
	} );

	const langParam = getLanguageRouteParam();

	const showcaseRoutes = [
		`/${ langParam }/themes/:tier(free|premium|marketplace)?/:view(collection)?`,
		`/${ langParam }/themes/:tier(free|premium|marketplace)?/filter/:filter?/:view(collection)?`,
		`/${ langParam }/themes/:category(all)?/:tier(free|premium|marketplace)?/:view(collection)?`,
		`/${ langParam }/themes/:category(all)?/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium|marketplace)?/:view(collection)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?`,
	];

	router(
		showcaseRoutes,
		ssrSetupLocale,
		fetchThemeFilters,
		validateVertical,
		validateFilters,
		fetchThemeData,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		renderThemes,
		makeLayout
	);
	router( [ '/themes/upload', '/themes/upload/*' ], makeLayout );
	// Redirect legacy (Atlas-based Theme Showcase v4) routes
	router(
		[
			'/themes/:site?/search/:search',
			'/themes/:site?/type/:tier(free|premium|marketplace)',
			'/themes/:site?/search/:search/type/:tier(free|premium|marketplace)',
		],
		redirectSearchAndType
	);
	router(
		[
			'/themes/:site?/filter/:filter',
			'/themes/:site?/filter/:filter/type/:tier(free|premium|marketplace)',
		],
		redirectFilterAndType
	);
	router(
		[ '/themes/:theme/:section(support)?', '/themes/:site/:theme/:section(support)?' ],
		( { res, params: { site, theme, section } }, next ) =>
			redirectToThemeDetails( res.redirect, site, theme, section, next )
	);
	// The following route definition is needed so direct hits on `/themes/<mysite>` don't result in a 404.
	router( '/themes/*', fetchThemeData, renderThemes, makeLayout );
}
