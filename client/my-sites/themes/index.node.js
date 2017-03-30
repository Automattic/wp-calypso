/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { getSubjects } from './theme-filters.js';
import { fetchThemeDataWithCaching, loggedOut } from './controller';

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router ) {
	const verticals = getSubjects().join( '|' );

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( config.isEnabled( 'manage/themes-ssr' ) ) {
			router( `/design/:vertical(${ verticals })?/:tier(free|premium)?`, fetchThemeDataWithCaching, loggedOut, makeLayout );
			router(
				`/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`,
				fetchThemeDataWithCaching,
				loggedOut,
				makeLayout
			);
			router( '/design/upload/*', makeLayout );
			// The following route definition is needed so direct hits on `/design/<mysite>` don't result in a 404.
			router( '/design/*', fetchThemeDataWithCaching, loggedOut, makeLayout );
		} else {
			router( `/design/:vertical(${ verticals })?/:tier(free|premium)?`, makeLayout );
			router( `/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`, makeLayout );
			router( '/design/upload/*', makeLayout );
			// The following route definition is needed so direct hits on `/design/<mysite>` don't result in a 404.
			router( '/design/*', makeLayout );
		}
	}
}
