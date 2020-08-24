/**
 * Internal dependencies
 */
import { makeLayout } from 'controller';
import {
	fetchThemeData,
	fetchThemeFilters,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails,
} from './controller';
import { validateFilters, validateVertical } from './validate-filters';

export default function ( router ) {
	// Redirect interim showcase route to permanent one
	router( [ '/design', '/design/*' ], ( { originalUrl, res } ) => {
		res.redirect( 301, '/themes' + originalUrl.slice( '/design'.length ) );
	} );

	const showcaseRoutes = [
		'/themes/:tier(free|premium)?',
		'/themes/:tier(free|premium)?/filter/:filter',
		'/themes/:vertical?/:tier(free|premium)?',
		'/themes/:vertical?/:tier(free|premium)?/filter/:filter',
	];
	router(
		showcaseRoutes,
		fetchThemeFilters,
		validateVertical,
		validateFilters,
		fetchThemeData,
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
		redirectSearchAndType
	);
	router(
		[ '/themes/:site?/filter/:filter', '/themes/:site?/filter/:filter/type/:tier(free|premium)' ],
		redirectFilterAndType
	);
	router(
		[ '/themes/:theme/:section(support)?', '/themes/:site/:theme/:section(support)?' ],
		redirectToThemeDetails
	);
	// The following route definition is needed so direct hits on `/themes/<mysite>` don't result in a 404.
	router( '/themes/*', fetchThemeData, loggedOut, makeLayout );
}
