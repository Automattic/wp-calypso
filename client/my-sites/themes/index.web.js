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
	selectSiteIfLoggedInWithSites,
	siteSelection,
	sites,
	hideNavigationIfLoggedInWithNoSites,
	addNavigationIfLoggedIn,
} from 'calypso/my-sites/controller';
import { displayLoTS } from 'calypso/my-sites/themes/v2/controller';
import { fetchThemeData, redirectToThemeDetails } from './controller';
import { renderThemes, upload } from './controller-logged-in';
import { fetchAndValidateVerticalsAndFilters } from './validate-filters';

export default function ( router ) {
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	const langParam = getLanguageRouteParam();
	const routesWithoutSites = [
		`/${ langParam }/themes/:tier(free|premium|marketplace)?/:view(collection)?`,
		`/${ langParam }/themes/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?`,
		`/${ langParam }/themes/:category(all|my-themes)?/:tier(free|premium|marketplace)?/:view(collection)?`,
		`/${ langParam }/themes/:category(all|my-themes)?/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium|marketplace)?/:view(collection)?`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?`,
	];
	const routesWithSites = [
		`/${ langParam }/themes/:tier(free|premium|marketplace)?/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:category(all|my-themes)?/:tier(free|premium|marketplace)?/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:category(all|my-themes)?/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium|marketplace)?/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:vertical?/:tier(free|premium|marketplace)?/filter/:filter/:view(collection)?/:site_id(${ siteId })`,
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
		renderThemes,
		navigation,
		makeLayout,
		clientRender
	);

	const featureFlag = true;

	router(
		routesWithoutSites,
		redirectWithoutLocaleParamIfLoggedIn,
		fetchAndValidateVerticalsAndFilters,
		selectSiteIfLoggedInWithSites,
		featureFlag ? displayLoTS : renderThemes,
		hideNavigationIfLoggedInWithNoSites,
		addNavigationIfLoggedIn,
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

	router( '/themes/*', fetchThemeData, renderThemes, makeLayout );
}
