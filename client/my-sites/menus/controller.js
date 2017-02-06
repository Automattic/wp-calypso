/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import sitesFactory from 'lib/sites-list';
import route from 'lib/route';
import analytics from 'lib/analytics';
import MainComponent from 'components/main';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import MenusComponent from 'my-sites/menus/main';
import notices from 'notices';
import siteMenus from 'lib/menu-data';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderWithReduxStore } from 'lib/react-helpers';

const sites = sitesFactory();

export default function menus( context ) {
	const analyticsPageTitle = 'Menus',
		basePath = route.sectionify( context.path ),
		site = sites.getSelectedSite();
	let baseAnalyticsPath;

	if ( site && site.capabilities && ! site.capabilities.edit_theme_options ) {
		notices.error( i18n.translate( 'You are not authorized to manage settings for this site.' ) );
		return;
	}

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Menus', { textOnly: true } ) ) );

	function renderJetpackUpgradeMessage() {
		renderWithReduxStore(
			React.createElement( MainComponent, null,
				React.createElement( JetpackManageErrorPage, {
					template: 'updateJetpack',
					site: site,
					version: '3.5',
					illustration: '/calypso/images/drake/drake-nomenus.svg',
					secondaryAction: i18n.translate( 'Open Classic Menu Editor' ),
					secondaryActionURL: site.options.admin_url + 'nav-menus.php',
					secondaryActionTarget: '_blank'
				} )
			),
			document.getElementById( 'primary' ),
			context.store
		);
	}

	if ( site && site.jetpack && ! site.hasJetpackMenus ) {
		renderJetpackUpgradeMessage();
		return;
	}

	if ( site ) {
		baseAnalyticsPath = basePath + '/:site';
	} else {
		baseAnalyticsPath = basePath;
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

	renderWithReduxStore(
		React.createElement( MenusComponent, {
			siteMenus: siteMenus,
			key: siteMenus.siteID,
			site: site
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}
