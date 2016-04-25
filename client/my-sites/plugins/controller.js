/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	some = require( 'lodash/some' ),
	capitalize = require( 'lodash/capitalize' );

/**
 * Internal Dependencies
 */
var route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	notices = require( 'notices' ),
	sites = require( 'lib/sites-list' )(),
	analytics = require( 'lib/analytics' ),
	PlanSetup = require( './plan-setup' ),
	PluginListComponent = require( './main' ),
	PluginComponent = require( './plugin' ),
	PluginBrowser = require( './plugins-browser' ),
	titleActions = require( 'lib/screen-title/actions' ),
	renderWithReduxStore = require( 'lib/react-helpers' ).renderWithReduxStore,
	allowedCategoryNames = [ 'new', 'popular', 'featured' ];

/**
 * Module variables
 */
var lastPluginsListVisited,
	lastPluginsQuerystring,
	controller;

function renderSinglePlugin( context, siteUrl ) {
	var pluginSlug = decodeURIComponent( context.params.plugin ),
		site = sites.getSelectedSite(),
		analyticsPageTitle = 'Plugins',
		baseAnalyticsPath;

	baseAnalyticsPath = 'plugins/:plugin';
	if ( site ) {
		baseAnalyticsPath += '/:site';
	}

	analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Plugin Details' );

	// Scroll to the top
	window.scrollTo( 0, 0 );

	// Render single plugin component
	renderWithReduxStore(
		React.createElement( PluginComponent, {
			path: context.path,
			prevPath: lastPluginsListVisited || context.prevPath,
			prevQuerystring: lastPluginsQuerystring,
			sites: sites,
			pluginSlug: pluginSlug,
			siteUrl: siteUrl,
			onPluginRefresh: title => titleActions.setTitle( title )
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function getPathWithoutSiteSlug( context, site ) {
	let path = context.pathname;
	if ( site && site.slug ) {
		path = path.replace( '/' + site.slug, '' );
	}
	return path;
}

function renderPluginList( context, basePath, siteUrl ) {
	var search = context.query.s,
		site = sites.getSelectedSite(),
		analyticsPageTitle;

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;
	titleActions.setTitle( i18n.translate( 'Plugins', { textOnly: true } ), { siteID: siteUrl } );

	renderWithReduxStore(
		React.createElement( PluginListComponent, {
			path: basePath,
			context: context,
			filter: context.params.pluginFilter,
			sites: sites,
			search: search
		} ),
		document.getElementById( 'primary' ),
		context.store
	);

	if ( search ) {
		analytics.ga.recordEvent( 'Plugins', 'Search', 'Search term', search );
	}

	analyticsPageTitle = 'Plugins' + ( context.params.pluginFilter ? ' ' + capitalize( context.params.pluginFilter ) : '' );
	analytics.pageView.record( context.pathname.replace( site.domain, ':site' ), analyticsPageTitle );
}

function renderPluginsBrowser( context, siteUrl ) {
	var site = sites.getSelectedSite(),
		category = context.params.category,
		searchTerm = context.query.s,
		analyticsPageTitle;

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;

	if ( context.params.siteOrCategory &&
			allowedCategoryNames.indexOf( context.params.siteOrCategory ) >= 0 ) {
		category = context.params.siteOrCategory;
	}
	if ( ! site && allowedCategoryNames.indexOf( context.params.siteOrCategory ) < 0 ) {
		site = { slug: context.params.siteOrCategory };
	}

	titleActions.setTitle( i18n.translate( 'Plugin Browser', { textOnly: true } ), { siteID: siteUrl } );

	analyticsPageTitle = 'Plugin Browser' + ( category ? ': ' + category : '' );
	analytics.pageView.record( context.pathname.replace( site.domain, ':site' ), analyticsPageTitle );

	ReactDom.render(
		React.createElement( PluginBrowser, {
			site: site ? site.slug : null,
			path: context.path,
			category: category,
			sites: sites,
			search: searchTerm
		} ),
		document.getElementById( 'primary' )
	);
}

function renderProvisionPlugins( context ) {
	let site = sites.getSelectedSite();

	renderWithReduxStore(
		React.createElement( PlanSetup, {
			selectedSite: site,
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

controller = {

	plugins: function( filter, context ) {
		var basePath = route.sectionify( context.path ),
			siteUrl = route.getSiteFragment( context.path );

		context.params.pluginFilter = filter;
		basePath = basePath.replace( '/' + filter, '' );
		notices.clearNotices( 'notices' );
		renderPluginList( context, basePath, siteUrl );
	},

	plugin: function( context ) {
		var siteUrl = route.getSiteFragment( context.path );

		if ( siteUrl && context.params.plugin && context.params.plugin === siteUrl.toString() ) {
			controller.plugins( 'all', context );
			return;
		}

		notices.clearNotices( 'notices' );
		renderSinglePlugin( context, siteUrl );
	},

	browsePlugins: function( context ) {
		var siteUrl = route.getSiteFragment( context.path );

		renderPluginsBrowser( context, siteUrl );
	},

	jetpackCanUpdate: function( filter, context, next ) {
		let redirectToPlugins = false,
			selectedSites = sites.getSelectedOrAllWithPlugins();

		if ( 'updates' === filter && selectedSites.length ) {
			redirectToPlugins = ! some( sites.getSelectedOrAllWithPlugins(), function( site ) {
				return site && site.jetpack && site.canUpdateFiles;
			} );

			if ( redirectToPlugins ) {
				if ( context.params && context.params.site_id ) {
					page.redirect( '/plugins/' + context.params.site_id );
					return;
				}
				page.redirect( '/plugins' );
				return;
			}
		}
		next();
	},

	setupPlugins: function( context ) {
		renderProvisionPlugins( context );
	}

};

module.exports = controller;
