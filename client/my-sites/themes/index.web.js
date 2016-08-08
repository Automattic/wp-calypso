/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import { makeLayout } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { singleSite, multiSite, loggedOut } from './controller';

// FIXME: These routes will SSR the logged-out Layout even if logged-in.
// While subsequently replaced by the logged-in Layout on the client-side,
// we'll want to render it on the server, too.

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( isLoggedIn ) {
			router( '/design/:tier(free|premium)?', multiSite, navigation, siteSelection );
			router( '/design/:tier(free|premium)?/:site_id', singleSite, navigation, siteSelection );
			router( '/design/:tier(free|premium)?/filter/:filter', multiSite, navigation, siteSelection );
			router( '/design/:tier(free|premium)?/filter/:filter/:site_id', singleSite, navigation, siteSelection );
		} else {
			router( '/design/:tier(free|premium)?', loggedOut, makeLayout );
			router( '/design/:tier(free|premium)?/filter/:filter', loggedOut, makeLayout );
		}
	}
}
