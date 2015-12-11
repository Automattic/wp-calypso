/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	config = require( 'config' ),
	analytics = require( 'analytics' ),
	titlecase = require( 'to-title-case' ),
	SiteSettingsComponent = require( 'my-sites/site-settings/main' ),
	DeleteSite = require( './delete-site' ),
	StartOver = require( './start-over' ),
	titleActions = require( 'lib/screen-title/actions' );

function canDeleteSite( site ) {
	return site.capabilities && site.capabilities.manage_options && ! site.jetpack && ! site.is_vip;
}

module.exports = {

	redirectToGeneral: function() {
		page.redirect( '/settings/general' );
	},

	siteSettings: function( context ) {
		var analyticsPageTitle = 'Site Settings',
			basePath = route.sectionify( context.path ),
			fiveMinutes = 5 * 60 * 1000,
			site;

		titleActions.setTitle( i18n.translate( 'Site Settings', { textOnly: true } ),
			{ siteID: route.getSiteFragment( context.path ) }
		);

		site = sites.getSelectedSite();

		// if site loaded, but user cannot manage site, redirect
		if ( 'undefined' !== typeof site.user_can_manage && ! site.user_can_manage ) {
			page.redirect( '/stats' );
			return;
		}

		// if user went directly to jetpack settings page, redirect
		if ( site.jetpack && ! config.isEnabled( 'manage/jetpack' ) ) {
			window.location.href = '//wordpress.com/manage/' + site.ID;
			return;
		}

		if ( ! site.latestSettings || new Date().getTime() - site.latestSettings > ( fiveMinutes ) ) {
			if ( sites.initialized ) {
				site.fetchSettings();
			} else {
				sites.once( 'change', function() {
					site = sites.getSelectedSite();
					site.fetchSettings();
				} );
			}
		}

		ReactDom.render(
			React.createElement( SiteSettingsComponent, {
				context: context,
				sites: sites,
				subsection: context.params.subsection,
				section: context.params.section,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);

		// analytics tracking
		if ( 'undefined' !== typeof context.params.section ) {
			analyticsPageTitle += ' > ' + titlecase( context.params.section );
		}
		if ( 'undefined' !== typeof context.params.subsection ) {
			analyticsPageTitle += ' > ' + titlecase( context.params.section );
		}
		analytics.pageView.record( basePath + '/:site', analyticsPageTitle );
	},

	importSite: function( context ) {
		ReactDom.render(
			React.createElement( SiteSettingsComponent, {
				context: context,
				sites: sites,
				section: 'import',
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	exportSite: function( context ) {
		ReactDom.render(
			React.createElement( SiteSettingsComponent, {
				context: context,
				sites: sites,
				section: 'export',
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	deleteSite: function( context ) {
		var site = sites.getSelectedSite();

		if ( sites.initialized ) {
			if ( ! canDeleteSite( site ) ) {
				return page( '/settings/general/' + site.slug );
			}
		} else {
			sites.once( 'change', function() {
				site = sites.getSelectedSite();
				if ( ! canDeleteSite( site ) ) {
					return page( '/settings/general/' + site.slug );
				}
			} );
		}

		ReactDom.render(
			React.createElement( DeleteSite, {
				context: context,
				sites: sites,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	startOver: function( context ) {
		var site = sites.getSelectedSite();

		if ( sites.initialized ) {
			if ( ! canDeleteSite( site ) ) {
				return page( '/settings/general/' + site.slug );
			}
		} else {
			sites.once( 'change', function() {
				site = sites.getSelectedSite();
				if ( ! canDeleteSite( site ) ) {
					return page( '/settings/general/' + site.slug );
				}
			} );
		}

		ReactDom.render(
			React.createElement( StartOver, {
				context: context,
				sites: sites,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	legacyRedirects: function( context, next ) {
		var section = context.params.section,
			redirectMap;
		if ( ! context ) {
			return page( '/me/public-profile' );
		}
		redirectMap = {
			account: '/me/account',
			password: '/me/security',
			security: '/me/security',
			'public-profile': '/me/public-profile',
			notifications: '/me/notifications',
			disbursements: '/me/public-profile',
			earnings: '/me/public-profile',
			'billing-history': '/me/billing',
			'billing-history-v2': '/me/billing',
			'connected-apps': '/me/security/connected-applications'
		};
		if ( redirectMap[ section ] ) {
			return page.redirect( redirectMap[ section ] );
		}
		next();
	},

	setScroll: function( context, next ) {
		window.scroll( 0, 0 );
		next();
	}

};
