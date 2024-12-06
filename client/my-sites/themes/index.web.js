import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectLoggedOut,
	redirectWithoutLocaleParamIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import {
	addNavigationIfLoggedIn,
	navigation,
	noSite,
	siteSelection,
	sites,
} from 'calypso/my-sites/controller';
import { fetchThemeData, redirectToThemeDetails } from './controller';
import { renderThemes, upload } from './controller-logged-in';
import { getTierRouteParam } from './helpers';
import { fetchAndValidateVerticalsAndFilters } from './validate-filters';

export default function ( router ) {
	const siteId =
		'\\d+' + // numeric site id
		'|' + // or
		'[^\\\\/.]+\\.[^\\\\/]+'; // one-or-more non-slash-or-dot chars, then a dot, then one-or-more non-slashes

	const langParam = getLanguageRouteParam();
	const tierParam = getTierRouteParam();

	const routesWithoutSites = [
		`/${ langParam }/themes/${ tierParam }/:view(collection)?`,
		`/${ langParam }/themes/${ tierParam }/filter/:filter/:view(collection)?`,
		`/${ langParam }/themes/:category(all|my-themes)?/${ tierParam }/:view(collection)?`,
		`/${ langParam }/themes/:category(all|my-themes)?/${ tierParam }/filter/:filter/:view(collection)?`,
		`/${ langParam }/themes/:vertical?/${ tierParam }/:view(collection)?`,
		`/${ langParam }/themes/:vertical?/${ tierParam }/filter/:filter/:view(collection)?`,
	];
	const routesWithSites = [
		`/${ langParam }/themes/${ tierParam }/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/${ tierParam }/filter/:filter/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:category(all|my-themes)?/${ tierParam }/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:category(all|my-themes)?/${ tierParam }/filter/:filter/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:vertical?/${ tierParam }/:view(collection)?/:site_id(${ siteId })`,
		`/${ langParam }/themes/:vertical?/${ tierParam }/filter/:filter/:view(collection)?/:site_id(${ siteId })`,
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

	router(
		routesWithoutSites,
		redirectWithoutLocaleParamIfLoggedIn,
		fetchAndValidateVerticalsAndFilters,
		noSite,
		renderThemes,
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
