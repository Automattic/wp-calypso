/**
 * External Dependencies
 */
var page = require( 'page' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	user = require( 'lib/user' )(),
	i18n = require( 'lib/mixins/i18n' ),
	notices = require( 'notices' ),
	route = require( 'lib/route' ),
	analytics = require( 'analytics' ),
	titleActions = require( 'lib/screen-title/actions' ),
	analyticsPageTitle = 'Sharing';

module.exports = {
	layout: function( context ) {
		var Sharing = require( 'my-sites/sharing/main' ),
			site = sites.getSelectedSite(),
			siteUrl = route.getSiteFragment( context.path );

		titleActions.setTitle( i18n.translate( 'Sharing', { textOnly: true } ), { siteID: siteUrl } );

		if ( site && ! site.settings ) {
			site.fetchSettings();
		}

		ReactDom.render(
			React.createElement( Sharing, {
				path: context.path,
				contentComponent: context.contentComponent
			} ),
			document.getElementById( 'primary' )
		);
	},

	connections: function( context, next ) {
		var SharingConnections = require( 'my-sites/sharing/connections/connections' ),
			servicesList = require( 'lib/services-list' )(),
			connectionsList = require( 'lib/connections-list' )(),
			site = sites.getSelectedSite(),
			basePath = route.sectionify( context.path ),
			baseAnalyticsPath;

		if ( site ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		if ( site && site.capabilities && ! site.capabilities.publish_posts ) {
			notices.error( i18n.translate( 'You are not authorized to manage sharing settings for this site.' ) );
		}

		if ( site && site.jetpack && ! site.isModuleActive( 'publicize' ) ) {
			// Redirect to sharing buttons if Jetpack Publicize module is not
			// active, but ShareDaddy is active
			page.redirect( site.isModuleActive( 'sharedaddy' ) ? '/sharing/buttons/' + sites.selected : '/stats' );
		} else {
			analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Connections' );

			context.contentComponent = React.createElement( SharingConnections, {
				user: user,
				services: servicesList,
				connections: connectionsList,
				sites: sites
			} );
		}

		next();
	},

	buttons: function( context, next ) {
		var SharingButtons = require( 'my-sites/sharing/buttons/buttons' ),
			sharingButtonsList = require( 'lib/sharing-buttons-list' )(),
			postTypesList = require( 'lib/post-types-list' )(),
			site = sites.getSelectedSite(),
			basePath = route.sectionify( context.path ),
			baseAnalyticsPath;

		if ( site ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Sharing Buttons' );

		if ( site && ! site.user_can_manage ) {
			notices.error( i18n.translate( 'You are not authorized to manage sharing settings for this site.' ) );
		}

		if ( site && site.jetpack && ( ! site.isModuleActive( 'sharedaddy' ) || site.versionCompare( '3.4-dev', '<' ) ) ) {
			notices.error( i18n.translate( 'This page is only available to Jetpack sites running version 3.4 or higher with the Sharing module activated.' ) );
		}

		context.contentComponent = React.createElement( SharingButtons, {
			site: site,
			buttons: sharingButtonsList,
			postTypes: postTypesList
		} );

		next();
	}
};
