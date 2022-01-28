import {
	makeLayout,
	redirectLoggedOut,
	redirectWithoutLocaleParamIfLoggedIn,
} from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils/path';
import {
	navigation,
	selectSiteIfLoggedIn,
	siteSelection,
	sites,
} from 'calypso/my-sites/controller';
import { loggedOut } from './controller';
import { loggedIn, upload } from './controller-logged-in';
import { fetchAndValidateVerticalsAndFilters } from './validate-filters';

export default function ( router ) {
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	const langParam = getLanguageRouteParam();
	const routesWithoutSites = [
		`/${ langParam }/themes/:tier(free|premium)?`,
		`/${ langParam }/themes/:tier(free|premium)?/filter/:filter`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?/filter/:filter`,
	];
	const routesWithSites = [
		`/${ langParam }/themes/:tier(free|premium)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium)?/filter/:filter/:site_id(${ siteId })`,
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
		redirectWithoutLocaleParamIfLoggedIn,
		redirectLoggedOut,
		fetchAndValidateVerticalsAndFilters,
		siteSelection,
		loggedIn,
		navigation,
		makeLayout
	);

	router(
		routesWithoutSites,
		redirectWithoutLocaleParamIfLoggedIn,
		selectSiteIfLoggedIn,
		fetchAndValidateVerticalsAndFilters,
		loggedOut,
		makeLayout
	);
}
