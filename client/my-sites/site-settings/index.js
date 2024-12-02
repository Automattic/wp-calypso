import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { get } from 'lodash';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	acceptSiteTransfer,
	deleteSite,
	disconnectSite,
	disconnectSiteConfirm,
	general,
	legacyRedirects,
	manageConnection,
	redirectToGeneral,
	redirectToTraffic,
	startOver,
	startSiteOwnerTransfer,
	renderSiteTransferredScreen,
	wpcomSiteTools,
} from 'calypso/my-sites/site-settings/controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import {
	redirectIfCantDeleteSite,
	redirectIfCantStartSiteOwnerTransfer,
} from 'calypso/sites/settings/administration/controller';

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

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/settings/delete-site/:site', ( context ) => {
			page.redirect( `/sites/settings/administration/${ context.params.site }/delete-site` );
		} );
	} else {
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
	}

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

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/settings/start-over/:site', ( context ) => {
			page.redirect( `/sites/settings/administration/${ context.params.site }/reset-site` );
		} );
	} else {
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
	}

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/settings/manage-connection/:site', ( context ) => {
			page.redirect( `/sites/settings/administration/${ context.params.site }/manage-connection` );
		} );
	} else {
		page(
			'/settings/manage-connection/:site_id',
			siteSelection,
			navigation,
			setScroll,
			manageConnection,
			makeLayout,
			clientRender
		);
	}

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/settings/start-site-transfer/:site', ( context ) => {
			page.redirect( `/sites/settings/administration/${ context.params.site }/transfer-site` );
		} );
	} else {
		page(
			'/settings/start-site-transfer/:site_id',
			siteSelection,
			redirectIfCantStartSiteOwnerTransfer,
			navigation,
			setScroll,
			startSiteOwnerTransfer,
			makeLayout,
			clientRender
		);
	}

	page(
		'/settings/site-transferred/:site_id',
		siteSelection,
		renderSiteTransferredScreen,
		makeLayout,
		clientRender
	);

	page(
		'/settings/site-transfer/:site_id/accept/:invitation_key',
		acceptSiteTransfer,
		makeLayout,
		clientRender
	);

	page( '/settings/traffic/:site_id', redirectToTraffic );
	page( '/settings/analytics/:site_id?', redirectToTraffic );
	page( '/settings/seo/:site_id?', redirectToTraffic );
	page( '/settings/theme-setup/:site_id?', redirectToGeneral );

	// Site tools for the WordPress.com > Site Tools menu
	// from the untangle Calypso project.
	page(
		'/settings/site-tools/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		wpcomSiteTools,
		makeLayout,
		clientRender
	);

	page( '/settings/:section', legacyRedirects, siteSelection, sites, makeLayout, clientRender );
}
