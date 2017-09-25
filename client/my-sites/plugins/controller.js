/**
 * External dependencies
 */
import { capitalize, some } from 'lodash';
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import PlanSetup from './jetpack-plugins-setup';
import PluginListComponent from './main';
import PluginComponent from './plugin';
import PluginEligibility from './plugin-eligibility';
import PluginUpload from './plugin-upload';
import PluginBrowser from './plugins-browser';
import analytics from 'lib/analytics';
import { renderWithReduxStore, renderPage } from 'lib/react-helpers';
import route from 'lib/route';
import notices from 'notices';
import { hasJetpackSites, getSelectedOrAllSitesWithPlugins } from 'state/selectors';
import { setSection } from 'state/ui/actions';
import { getSelectedSite, getSection } from 'state/ui/selectors';

/**
 * Module variables
 */
const allowedCategoryNames = [ 'new', 'popular', 'featured' ];

let lastPluginsListVisited,
	lastPluginsQuerystring;

function renderSinglePlugin( context, siteUrl ) {
	const pluginSlug = decodeURIComponent( context.params.plugin );
	const site = getSelectedSite( context.store.getState() );
	const analyticsPageTitle = 'Plugins';

	let baseAnalyticsPath = 'plugins/:plugin';

	if ( site ) {
		baseAnalyticsPath += '/:site';
	}

	analytics
	.pageView
	.record( baseAnalyticsPath, `${ analyticsPageTitle } > Plugin Details` );

	// Scroll to the top
	window.scrollTo( 0, 0 );

	let prevPath;
	if ( lastPluginsListVisited ) {
		prevPath = lastPluginsListVisited;
	} else if ( context.prevPath ) {
		prevPath = route.sectionify( context.prevPath );
	}

	// Render single plugin component
	renderWithReduxStore(
		React.createElement( PluginComponent, {
			path: context.path,
			prevQuerystring: lastPluginsQuerystring,
			prevPath,
			pluginSlug,
			siteUrl,
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

function renderPluginList( context, basePath ) {
	const search = context.query.s;
	const site = getSelectedSite( context.store.getState() );

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;

	renderWithReduxStore(
		React.createElement( PluginListComponent, {
			path: basePath,
			context,
			filter: context.params.pluginFilter,
			category: context.params.category,
			search
		} ),
		'primary',
		context.store
	);

	if ( search ) {
		analytics.ga.recordEvent( 'Plugins', 'Search', 'Search term', search );
	}

	const analyticsPageTitle = 'Plugins' +
		( context.params.pluginFilter
			? ' ' + capitalize( context.params.pluginFilter )
			: ''
		);

	let baseAnalyticsPath = 'plugins/manage';
	if ( site ) {
		baseAnalyticsPath += '/:site';
	}
	analytics
		.pageView
		.record( baseAnalyticsPath, analyticsPageTitle );
}

function renderPluginsBrowser( context ) {
	const searchTerm = context.query.s;
	const site = getSelectedSite( context.store.getState() );
	let { category } = context.params;

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;

	if (
		context.params.siteOrCategory &&
		allowedCategoryNames.indexOf( context.params.siteOrCategory ) >= 0
	) {
		category = context.params.siteOrCategory;
	}

	const analyticsPageTitle = 'Plugin Browser' + ( category ? ': ' + category : '' );
	let baseAnalyticsPath = 'plugins/browse' + ( category ? '/' + category : '' );
	if ( site ) {
		baseAnalyticsPath += '/:site';
	}

	analytics
	.pageView
	.record( baseAnalyticsPath, analyticsPageTitle );

	renderWithReduxStore(
		React.createElement( PluginBrowser, {
			path: context.path,
			category,
			search: searchTerm,
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderPluginWarnings( context ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const pluginSlug = decodeURIComponent( context.params.plugin );

	renderWithReduxStore(
		React.createElement( PluginEligibility, {
			siteSlug: site.slug,
			pluginSlug
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderProvisionPlugins( context ) {
	const state = context.store.getState();
	const section = getSection( state );
	const site = getSelectedSite( state );
	context.store.dispatch( setSection( Object.assign( {}, section, { secondary: false } ) ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	let baseAnalyticsPath = 'plugins/setup';
	if ( site ) {
		baseAnalyticsPath += '/:site';
	}

	analytics.pageView.record( baseAnalyticsPath, 'Jetpack Plugins Setup' );

	renderWithReduxStore(
		React.createElement( PlanSetup, {
			whitelist: context.query.only || false
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

const controller = {
	plugins( filter, context, next ) {
		const siteUrl = route.getSiteFragment( context.path );
		const basePath = route.sectionify( context.path ).replace( '/' + filter, '' );

		// bail if no site is selected and the user has no Jetpack sites.
		if ( ! siteUrl && ! hasJetpackSites( context.store.getState() ) ) {
			return next();
		}

		context.params.pluginFilter = filter;
		notices.clearNotices( 'notices' );
		renderPluginList( context, basePath );
	},

	plugin( context ) {
		const siteUrl = route.getSiteFragment( context.path );

		// If the "plugin" part of the route is actually a site, browse the plugins for that site instead.
		if (
			siteUrl &&
			context.params.plugin &&
			context.params.plugin === siteUrl.toString()
		) {
			controller.browsePlugins( context );
			return;
		}

		notices.clearNotices( 'notices' );
		renderSinglePlugin( context, siteUrl );
	},

	browsePlugins( context ) {
		renderPluginsBrowser( context );
	},

	upload( context ) {
		renderPage( context, <PluginUpload /> );
	},

	jetpackCanUpdate( filter, context, next ) {
		const selectedSites = getSelectedOrAllSitesWithPlugins( context.store.getState() );
		let redirectToPlugins = false;

		if ( 'updates' === filter && selectedSites.length ) {
			redirectToPlugins = ! some( selectedSites, function( site ) {
				return site && site.jetpack && site.canUpdateFiles;
			} );

			if ( redirectToPlugins ) {
				if ( context.params && context.params.site_id ) {
					page.redirect( `/plugins/manage/${ context.params.site_id }` );
					return;
				}
				page.redirect( '/plugins/manage' );
				return;
			}
		}
		next();
	},

	setupPlugins( context ) {
		renderProvisionPlugins( context );
	},

	eligibility( context ) {
		renderPluginWarnings( context );
	},

	resetHistory() {
		lastPluginsListVisited = null;
		lastPluginsQuerystring = null;
	}
};

export default controller;
