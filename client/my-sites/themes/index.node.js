/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router, renderer ) {
	if ( config.isEnabled( 'manage/themes' ) ) {
		router( '/design', makeLayout, renderer );
		router( '/design/type/:tier', makeLayout, renderer );
	}
}
