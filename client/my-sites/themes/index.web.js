/** @format */

/**
 * Internal dependencies
 */

import config from 'config';
import userFactory from 'lib/user';
import { makeLayout } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { loggedIn, loggedOut, upload, fetchThemeFilters, setUpLocale } from './controller';
import { validateFilters, validateVertical } from './validate-filters';

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( isLoggedIn ) {
			if ( config.isEnabled( 'manage/themes/upload' ) ) {
				router( '/themes/upload', siteSelection, sites, makeLayout );
				router( '/themes/upload/:site_id?', siteSelection, upload, navigation, makeLayout );
			}
			const loggedInRoutes = [
				`/themes/:tier(free|premium)?/:site_id(${ siteId })?`,
				`/themes/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })?`,
				`/themes/:vertical?/:tier(free|premium)?/:site_id(${ siteId })?`,
				`/themes/:vertical?/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })?`,
			];
			router(
				loggedInRoutes,
				fetchThemeFilters,
				validateVertical,
				validateFilters,
				siteSelection,
				loggedIn,
				navigation,
				makeLayout
			);
		} else {
			// No uploads when logged-out, so redirect to main showcase page
			router( '/themes/upload', '/themes' );
			router( '/themes/upload/*', '/themes' );

			const loggedOutRoutes = [
				'/themes/:tier(free|premium)?/:lang?',
				'/themes/:tier(free|premium)?/filter/:filter/:lang?',
				'/themes/:vertical?/:tier(free|premium)?/:lang?',
				'/themes/:vertical?/:tier(free|premium)?/filter/:filter/:lang?',
			];
			router(
				loggedOutRoutes,
				fetchThemeFilters,
				validateVertical,
				validateFilters,
				setUpLocale,
				loggedOut,
				makeLayout
			);
		}
	}
}
