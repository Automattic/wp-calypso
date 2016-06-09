/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router ) {
	if ( config.isEnabled( 'manage/themes' ) ) {
		router( '/design', makeLayout );
		router( '/design/type/:tier', makeLayout );
		router( '/design/*', makeLayout ); // Needed so direct hits don't result in a 404.
	}
}
