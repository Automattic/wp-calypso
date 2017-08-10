/** @format */
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
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( isLoggedIn ) {
			if ( config.isEnabled( 'manage/themes/upload' ) ) {
				router( '/themes/upload', makeSites, makeLayout );
				router( '/themes/upload/:site_id?', siteSelection, upload, makeNavigation, makeLayout );
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
				makeNavigation,
				makeLayout
			);
		} else {
			// No uploads when logged-out, so redirect to main showcase page
			router( '/themes/upload', '/themes' );
			router( '/themes/upload/*', '/themes' );

			const loggedOutRoutes = [
				'/themes/:tier(free|premium)?',
				'/themes/:tier(free|premium)?/filter/:filter',
				'/themes/:vertical?/:tier(free|premium)?',
				'/themes/:vertical?/:tier(free|premium)?/filter/:filter',
			];
			router(
				loggedOutRoutes,
				fetchThemeFilters,
				validateVertical,
				validateFilters,
				loggedOut,
				makeLayout
			);
		}
	}
}
