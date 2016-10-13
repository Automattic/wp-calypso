/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { getSubjects } from './theme-filters.js';

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router ) {
	const verticals = getSubjects().join( '|' );

	if ( config.isEnabled( 'manage/themes' ) ) {
		router( `/design/:vertical(${ verticals })?/:tier(free|premium)?`, makeLayout );
		router( `/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`, makeLayout );
		router( '/design/*', makeLayout ); // Needed so direct hits don't result in a 404.
	}
}
