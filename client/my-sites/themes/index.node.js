/** @format */

/**
 * Internal dependencies
 */

import config from 'config';
import { makeLayout } from 'controller';
import {
	fetchThemeData,
	fetchThemeFilters,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails,
	setUpLocale,
} from './controller';
import { validateFilters, validateVertical } from './validate-filters';

export default function( router ) {
	if ( config.isEnabled( 'manage/themes' ) ) {
		// Redirect interim showcase route to permanent one
		router( [ '/design', '/design/*' ], ( { originalUrl, res } ) => {
			res.redirect( 301, '/themes' + originalUrl.slice( '/design'.length ) );
		} );

		const showcaseRoutes = [
			'/themes/:lang?',
			'/themes/:tier(free|premium)?/:lang?',
			'/themes/:tier(free|premium)?/filter/:filter/:lang?',
			'/themes/:vertical?/:tier(free|premium)?/:lang?',
			'/themes/:vertical?/:tier(free|premium)?/filter/:filter/:lang?',
		];
		router(
			showcaseRoutes,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			fetchThemeData,
			setUpLocale,
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
}
