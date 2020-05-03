/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	deleteSite,
	disconnectSite,
	disconnectSiteConfirm,
	general,
	legacyRedirects,
	manageConnection,
	redirectIfCantDeleteSite,
	redirectToTraffic,
	startOver,
	themeSetup,
} from 'my-sites/site-settings/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';

export default function () {
	page( '/settings', '/settings/general' );

	page(
		'/settings/general/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		general,
		makeLayout,
		clientRender
	);

	// Redirect settings pages for import and export now that they have their own sections.
	page( '/settings/:importOrExport(import|export)/:subroute(.*)', ( context ) => {
		const importOrExport = get( context, 'params.importOrExport' );
		const subroute = get( context, 'params.subroute' );
		const queryString = get( context, 'querystring' );
		let redirectPath = `/${ importOrExport }`;

		if ( subroute ) {
			redirectPath += `/${ subroute }`;
		}

		if ( queryString ) {
			redirectPath += `?${ queryString }`;
		}

		return page.redirect( redirectPath );
	} );

	page(
		'/settings/delete-site/:site_id',
		siteSelection,
		redirectIfCantDeleteSite,
		navigation,
		setScroll,
		deleteSite,
		makeLayout,
		clientRender
	);

	page(
		`/settings/disconnect-site/:site_id`,
		siteSelection,
		setScroll,
		disconnectSite,
		makeLayout,
		clientRender
	);

	page(
		'/settings/disconnect-site/confirm/:site_id',
		siteSelection,
		setScroll,
		disconnectSiteConfirm,
		makeLayout,
		clientRender
	);

	page(
		'/settings/start-over/:site_id',
		siteSelection,
		redirectIfCantDeleteSite,
		navigation,
		setScroll,
		startOver,
		makeLayout,
		clientRender
	);
	page(
		'/settings/theme-setup/:site_id',
		siteSelection,
		navigation,
		setScroll,
		themeSetup,
		makeLayout,
		clientRender
	);

	page(
		'/settings/manage-connection/:site_id',
		siteSelection,
		navigation,
		setScroll,
		manageConnection,
		makeLayout,
		clientRender
	);

	page( '/settings/traffic/:site_id', redirectToTraffic );
	page( '/settings/analytics/:site_id?', redirectToTraffic );
	page( '/settings/seo/:site_id?', redirectToTraffic );

	page( '/settings/:section', legacyRedirects, siteSelection, sites, makeLayout, clientRender );
}
