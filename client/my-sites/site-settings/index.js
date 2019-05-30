/** @format */
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
import { reasonComponents as reasons } from './disconnect-site';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';

export default function() {
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

	page( '/settings/import/:site_id', ( context, next ) => {
		const site_id = get( context, 'params.site_id' );
		if ( site_id ) {
			return page.redirect( `/import/${ site_id }` );
		}

		next();
	} );

	page( '/settings/export/:site_id', ( context, next ) => {
		const site_id = get( context, 'params.site_id' );
		if ( site_id ) {
			return page.redirect( `/export/${ site_id }` );
		}

		next();
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

	const reasonSlugs = Object.keys( reasons );
	page(
		`/settings/disconnect-site/:step(${ [ ...reasonSlugs, 'confirm' ].join( '|' ) })?`,
		sites,
		makeLayout,
		clientRender
	);

	page(
		`/settings/disconnect-site/:reason(${ reasonSlugs.join( '|' ) })?/:site_id`,
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
