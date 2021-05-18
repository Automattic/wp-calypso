/**
 * Internal dependencies
 */
import { makeLayout, redirectLoggedOut } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { loggedOut, selectSiteIfLoggedIn } from './controller';
import { loggedIn, upload } from './controller-logged-in';
import {
	fetchAndValidateVerticalsAndFiltersIfLoggedIn,
	fetchAndValidateVerticalsAndFiltersIfLoggedOut,
} from './validate-filters';

export default function ( router ) {
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

	router(
		routesWithSites,
		redirectLoggedOut, // if logged out, redirect to login
		fetchAndValidateVerticalsAndFiltersIfLoggedIn,
		siteSelection,
		loggedIn,
		navigation,
		makeLayout
	);

	router(
		routesWithoutSites,
		selectSiteIfLoggedIn,
		fetchAndValidateVerticalsAndFiltersIfLoggedOut,
		loggedOut,
		makeLayout
	);
}
