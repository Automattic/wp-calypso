/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { getSelectedSite } from 'client/state/ui/selectors';
import route from 'lib/route';
import i18n from 'lib/mixins/i18n';
import analytics from 'analytics';
import MainComponent from 'components/main';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import itemTypes from 'my-sites/menus/menu-item-types';
import MenusComponent from 'my-sites/menus/main';
import notices from 'notices';
import siteMenus from 'lib/menu-data';
import titleActions from 'lib/screen-title/actions';

export function menus( context, next ) {
	var analyticsPageTitle = 'Menus',
		basePath = route.sectionify( context.path ),
		site = getSelectedSite( context.store.getState() ),
		baseAnalyticsPath;

	if ( site && site.capabilities && ! site.capabilities.edit_theme_options ) {
		notices.error( i18n.translate( 'You are not authorized to manage settings for this site.' ) );
		return;
	}

	titleActions.setTitle( i18n.translate( 'Menus', { textOnly: true } ), { siteID: context.params.site_id } );

	function createJetpackUpgradeMessage() {
		return React.createElement( MainComponent, null,
			React.createElement( JetpackManageErrorPage, {
				template: 'updateJetpack',
				site: site,
				version: '3.5',
				illustration: '/calypso/images/drake/drake-nomenus.svg',
				secondaryAction: i18n.translate( 'Open Classic Menu Editor' ),
				secondaryActionURL: site.options.admin_url + 'nav-menus.php',
				secondaryActionTarget: '_blank'
			} )
		);
	}

	if ( site && site.jetpack && ! site.hasJetpackMenus ) {
		context.primary = createJetpackUpgradeMessage();
		return next();
	}

	if ( site ) {
		baseAnalyticsPath = basePath + '/:site';
	} else {
		baseAnalyticsPath = basePath;
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

	context.primary = React.createElement( MenusComponent, {
		siteMenus: siteMenus,
		itemTypes: itemTypes,
		key: siteMenus.siteID,
		site: site
	} );
	next();
};
