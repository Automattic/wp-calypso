/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import { makeLayout } from 'controller';
import { makeNavigation, siteSelection, makeSites } from 'my-sites/controller';
import { loggedIn, loggedOut, upload, fetchThemeFilters } from './controller';
import { validateFilters, validateVertical } from './validate-filters';

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();
	const siteId = '\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

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
				`/themes/:tier(free|premium)?/:site_id(${ siteId })?`,
				siteSelection,
				loggedIn,
				makeNavigation,
				makeLayout
			);
			router(
				`/themes/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })?`,
				fetchThemeFilters,
				validateFilters,
				siteSelection,
				loggedIn,
				makeNavigation,
				makeLayout
			);
			router(
				`/themes/:vertical?/:tier(free|premium)?/:site_id(${ siteId })?`,
				fetchThemeFilters,
				validateVertical,
				siteSelection,
				loggedIn,
				makeNavigation,
				makeLayout
			);
			router(
				`/themes/:vertical?/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })?`,
				fetchThemeFilters,
				validateVertical,
				validateFilters,
				siteSelection,
				loggedIn,
				makeNavigation,
				makeLayout
			);
		} else {
			router(
				'/themes/:tier(free|premium)?',
				loggedOut,
				makeLayout
			);
			router(
				'/themes/:tier(free|premium)?/filter/:filter',
				fetchThemeFilters,
				validateFilters,
				loggedOut,
				makeLayout
			);
			router(
				'/themes/:vertical?/:tier(free|premium)?',
				fetchThemeFilters,
				validateVertical,
				loggedOut,
				makeLayout
			);
			router(
				'/themes/:vertical?/:tier(free|premium)?/filter/:filter',
				fetchThemeFilters,
				validateVertical,
				validateFilters,
				loggedOut,
				makeLayout
			);
		}
	}
}
