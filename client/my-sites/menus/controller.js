/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react'),
	i18n = require( 'i18n-calypso' ),
	ReactRedux = require( 'react-redux' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	analytics = require( 'lib/analytics' ),
	MainComponent = require( 'components/main' ),
	JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' ),
	itemTypes = require( 'my-sites/menus/menu-item-types' ),
	MenusComponent = require( 'my-sites/menus/main' ),
	notices = require( 'notices' ),
	siteMenus = require( 'lib/menu-data' ),
	titleActions = require( 'lib/screen-title/actions' );

var controller = {

	menus: function( context ) {
		var analyticsPageTitle = 'Menus',
			basePath = route.sectionify( context.path ),
			site = sites.getSelectedSite(),
			baseAnalyticsPath;

		if ( site && site.capabilities && ! site.capabilities.edit_theme_options ) {
			notices.error( i18n.translate( 'You are not authorized to manage settings for this site.' ) );
			return;
		}

		titleActions.setTitle( i18n.translate( 'Menus', { textOnly: true } ), { siteID: context.params.site_id } );

		function renderJetpackUpgradeMessage() {
			ReactDom.render(
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
				document.getElementById( 'primary' )
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

		ReactDom.render(
			React.createElement( ReactRedux.Provider, { store: context.store },
				React.createElement( MenusComponent, {
					siteMenus: siteMenus,
					itemTypes: itemTypes,
					key: siteMenus.siteID,
					site: site
				} )
			),
			document.getElementById( 'primary' )
		);
	}

};

module.exports = controller;
