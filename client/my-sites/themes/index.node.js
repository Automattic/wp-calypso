/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { getSubjects } from './theme-filters.js';
import {
	fetchThemeData,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails
} from './controller';

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router ) {
	const verticals = getSubjects().join( '|' );

	if ( config.isEnabled( 'manage/themes' ) ) {
		router( `/design/:vertical(${ verticals })?/:tier(free|premium)?`, fetchThemeData, loggedOut, makeLayout );
		router(
			`/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`,
			fetchThemeData,
			loggedOut,
			makeLayout
		);
		router( '/design/upload/*', makeLayout );
		// Redirect legacy (Atlas-based Theme Showcase v4) routes
		router( [
			'/design/:site?/search/:search',
			'/design/:site?/type/:tier(free|premium)',
			'/design/:site?/search/:search/type/:tier(free|premium)'
		], redirectSearchAndType );
		router( [
			'/design/:site?/filter/:filter',
			'/design/:site?/filter/:filter/type/:tier(free|premium)'
		], redirectFilterAndType );
		router( '/design/:site?/:theme/:section(support)?', redirectToThemeDetails );
		// The following route definition is needed so direct hits on `/design/<mysite>` don't result in a 404.
		router( '/design/*', fetchThemeData, loggedOut, makeLayout );
	}
}
