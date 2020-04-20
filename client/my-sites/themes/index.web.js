/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import { makeLayout, redirectLoggedOut } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { loggedIn, loggedOut, upload, fetchThemeFilters } from './controller';
import { validateFilters, validateVertical } from './validate-filters';

function redirectToLoginIfSiteRequested( context, next ) {
	if ( context.params.site_id ) {
		redirectLoggedOut( context, next );
		return;
	}

	next();
}

export default function ( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	const routes = [
		`/themes/:tier(free|premium)?/:site_id(${ siteId })?`,
		`/themes/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })?`,
		`/themes/:vertical?/:tier(free|premium)?/:site_id(${ siteId })?`,
		`/themes/:vertical?/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })?`,
	];

	// Upload routes are valid only when logged in. In logged-out sessions they redirect to login page.
	router( '/themes/upload', redirectLoggedOut, siteSelection, sites, makeLayout );
	router(
		'/themes/upload/:site_id',
		redirectLoggedOut,
		siteSelection,
		upload,
		navigation,
		makeLayout
	);

	if ( isLoggedIn ) {
		router(
			routes,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			siteSelection,
			loggedIn,
			navigation,
			makeLayout
		);
	} else {
		router(
			routes,
			redirectToLoginIfSiteRequested,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			loggedOut,
			makeLayout
		);
	}
}
