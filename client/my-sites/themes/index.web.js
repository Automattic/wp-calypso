/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import { makeLayout } from 'controller';
import { makeNavigation, siteSelection } from 'my-sites/controller';
import { singleSite, multiSite, loggedOut } from './controller';
import { getSubjects } from './theme-filters.js';

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();
	const verticals = getSubjects().join( '|' );

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( isLoggedIn ) {
			router(
				`/design/:vertical(${ verticals })?/:tier(free|premium)?`,
				multiSite, makeNavigation, makeLayout
			);
			router(
				`/design/:vertical(${ verticals })?/:tier(free|premium)?/:site_id`,
				siteSelection, singleSite, makeNavigation, makeLayout
			);
			router(
				`/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`,
				siteSelection, multiSite, makeNavigation, makeLayout
			);
			router(
				`/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter/:site_id`,
				siteSelection, singleSite, makeNavigation, makeLayout
			);
		} else {
			router( `/design/:vertical(${ verticals })?/:tier(free|premium)?`, loggedOut, makeLayout );
			router( `/design/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`, loggedOut, makeLayout );
		}
	}
}
