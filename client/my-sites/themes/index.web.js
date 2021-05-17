/**
 * Internal dependencies
 */
import userFactory from 'calypso/lib/user';
import { makeLayout, redirectLoggedOut } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { loggedOut, fetchThemeFilters } from './controller';
import { loggedIn, upload } from './controller-logged-in';
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

	const routesWithoutSites = [
		`/themes/:tier(free|premium)?`,
		`/themes/:tier(free|premium)?/filter/:filter`,
		`/themes/:vertical?/:tier(free|premium)?`,
		`/themes/:vertical?/:tier(free|premium)?/filter/:filter`,
	];
	const routesWithSites = [
		`/themes/:tier(free|premium)?/:site_id(${ siteId })`,
		`/themes/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })`,
		`/themes/:vertical?/:tier(free|premium)?/:site_id(${ siteId })`,
		`/themes/:vertical?/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })`,
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
		// routesWithSites - use loggedIn() middleware to display themes showcase
		router(
			routesWithSites,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			siteSelection,
			loggedIn,
			navigation,
			makeLayout
		);
		// routesWithoutSites - use sites() middleware to force site selection first. Don't display navigation()
		router(
			routesWithoutSites,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			siteSelection,
			sites,
			makeLayout
		);
	} else {
		router(
			routesWithSites.concat( routesWithoutSites ),
			redirectToLoginIfSiteRequested,
			fetchThemeFilters,
			validateVertical,
			validateFilters,
			loggedOut,
			makeLayout
		);
	}
}
