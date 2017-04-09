/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import { makeLayout } from 'controller';
import { makeNavigation, siteSelection, makeSites } from 'my-sites/controller';
import { singleSite, multiSite, loggedOut, upload } from './controller';
import { getSubjects } from './theme-filters';
import validateFilters from './validate-filters';

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();
	const verticals = getSubjects().join( '|' );

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( isLoggedIn ) {
			if ( config.isEnabled( 'manage/themes/upload' ) ) {
				router( '/themes/upload', makeSites, makeLayout );
				router(
					'/themes/upload/:site_id?',
					siteSelection, upload, makeNavigation, makeLayout
				);
			}
			router(
				`/themes/:vertical(${ verticals })?/:tier(free|premium)?`,
				siteSelection, multiSite, makeNavigation, makeLayout
			);
			router(
				`/themes/:vertical(${ verticals })?/:tier(free|premium)?/:site_id`,
				siteSelection, singleSite, makeNavigation, makeLayout
			);
			router(
				`/themes/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`,
				validateFilters, siteSelection, multiSite, makeNavigation, makeLayout
			);
			router(
				`/themes/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter/:site_id`,
				validateFilters, siteSelection, singleSite, makeNavigation, makeLayout
			);
		} else {
			router( `/themes/:vertical(${ verticals })?/:tier(free|premium)?`, loggedOut, makeLayout );
			router(
				`/themes/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`,
				validateFilters, loggedOut, makeLayout
			);
		}
	}
}
