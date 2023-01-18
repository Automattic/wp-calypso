import { getLanguageRouteParam } from '@automattic/i18n-utils';
import page from 'page';
import {
	makeLayout,
	redirectLoggedOut,
	redirectWithoutLocaleParamIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import {
	navigation,
	selectSiteIfLoggedIn,
	siteSelection,
	sites,
} from 'calypso/my-sites/controller';
import { fetchThemeData, loggedOut, redirectToThemeDetails } from './controller';
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
	router( '/themes/upload', redirectLoggedOut, siteSelection, sites, makeLayout, clientRender );
	router(
		'/themes/upload/:site_id',
		redirectLoggedOut,
		siteSelection,
		upload,
		navigation,
		makeLayout,
		clientRender
	);

	router(
		routesWithSites,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectLoggedOut,
		fetchAndValidateVerticalsAndFilters,
		siteSelection,
		loggedIn,
		navigation,
		makeLayout,
		clientRender
	);

	router(
		routesWithoutSites,
		redirectWithoutLocaleParamIfLoggedIn,
		fetchAndValidateVerticalsAndFilters,
		selectSiteIfLoggedIn, // This has to be after fetchAndValidateVerticalsAndFilters or else the redirect to theme/:theme will not work properly.
		loggedOut,
		makeLayout,
		clientRender
	);

	/**
	 * Although we redirect /themes/:theme from validateVerticals, we still need to redirect users from /themes/:theme/support.
	 */
	router(
		[
			'/themes/:theme/:section(support)?',
			`/themes/:theme/:section(support)?/:site_id(${ siteId })`,
		],
		( { params: { site_id, theme, section } }, next ) =>
			redirectToThemeDetails( page.redirect, site_id, theme, section, next )
	);

	router( '/themes/*', fetchThemeData, loggedOut, makeLayout );
}
