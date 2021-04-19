/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { includes, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { getSiteFragment, sectionify } from 'calypso/lib/route';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import PlanSetup from './jetpack-plugins-setup';
import PluginEligibility from './plugin-eligibility';
import PluginListComponent from './main';
import PluginComponent from './plugin';
import PluginBrowser from './plugins-browser';
import PluginUpload from './plugin-upload';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import MarketplaceDomainUpsell from './marketplace/marketplace-domain-upsell';

/**
 * Module variables
 */
const allowedCategoryNames = [ 'new', 'popular', 'featured' ];

let lastPluginsListVisited;
let lastPluginsQuerystring;

function renderSinglePlugin( context, siteUrl ) {
	const pluginSlug = decodeURIComponent( context.params.plugin );

	// Scroll to the top
	window.scrollTo( 0, 0 );

	let prevPath;
	if ( lastPluginsListVisited ) {
		prevPath = lastPluginsListVisited;
	} else if ( context.prevPath ) {
		prevPath = sectionify( context.prevPath );
	}

	// Render single plugin component
	context.primary = React.createElement( PluginComponent, {
		path: context.path,
		prevQuerystring: lastPluginsQuerystring,
		prevPath,
		pluginSlug,
		siteUrl,
	} );
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

	context.primary = React.createElement( PluginListComponent, {
		path: basePath,
		context,
		filter: context.params.pluginFilter,
		search,
	} );

	if ( search ) {
		gaRecordEvent( 'Plugins', 'Search', 'Search term', search );
	}
}

// The plugin browser can be rendered by the `/plugins/:plugin/:site_id?` route. In that case,
// the `:plugin` param is actually the side ID or category.
function getCategoryForPluginsBrowser( context ) {
	if ( context.params.plugin && includes( allowedCategoryNames, context.params.plugin ) ) {
		return context.params.plugin;
	}

	return context.params.category;
}

function renderPluginsBrowser( context ) {
	const searchTerm = context.query.s;
	const site = getSelectedSite( context.store.getState() );
	const category = getCategoryForPluginsBrowser( context );

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;

	context.primary = React.createElement( PluginBrowser, {
		path: context.path,
		category,
		search: searchTerm,
	} );
}

function renderPluginWarnings( context ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const pluginSlug = decodeURIComponent( context.params.plugin );

	context.primary = React.createElement( PluginEligibility, {
		siteSlug: site.slug,
		pluginSlug,
	} );
}

function renderProvisionPlugins( context ) {
	context.primary = React.createElement( PlanSetup, {
		forSpecificPlugin: context.query.only || false,
	} );
}

export function plugins( context, next ) {
	const { pluginFilter: filter = 'all' } = context.params;
	const basePath = sectionify( context.path ).replace( '/' + filter, '' );

	context.params.pluginFilter = filter;
	renderPluginList( context, basePath );
	next();
}

function plugin( context, next ) {
	const siteUrl = getSiteFragment( context.path );
	renderSinglePlugin( context, siteUrl );
	next();
}

// The plugin browser can be rendered by the `/plugins/:plugin/:site_id?` route.
// If the "plugin" part of the route is actually a site,
// render the plugin browser for that site. Otherwise render plugin.
export function browsePluginsOrPlugin( context, next ) {
	const siteUrl = getSiteFragment( context.path );

	if (
		context.params.plugin &&
		( ( siteUrl && context.params.plugin === siteUrl.toString() ) ||
			includes( allowedCategoryNames, context.params.plugin ) )
	) {
		browsePlugins( context, next );
		return;
	}

	plugin( context, next );
}

export function browsePlugins( context, next ) {
	renderPluginsBrowser( context );
	next();
}

export function upload( context, next ) {
	context.primary = <PluginUpload />;
	next();
}

export function jetpackCanUpdate( context, next ) {
	const selectedSites = getSelectedOrAllSitesWithPlugins( context.store.getState() );
	let redirectToPlugins = false;

	if ( 'updates' === context.params.pluginFilter && selectedSites.length ) {
		redirectToPlugins = ! some( selectedSites, function ( site ) {
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
}

export function setupPlugins( context, next ) {
	renderProvisionPlugins( context );
	next();
}

export function eligibility( context, next ) {
	renderPluginWarnings( context );
	next();
}

export function resetHistory() {
	lastPluginsListVisited = null;
	lastPluginsQuerystring = null;
}

export function scrollTopIfNoHash( context, next ) {
	if ( typeof window !== 'undefined' && ! window.location.hash ) {
		window.scrollTo( 0, 0 );
	}
	next();
}

export function renderDomainsPage( context, next ) {
	context.primary = React.createElement( MarketplaceDomainUpsell, {
		location: 'From render domains page',
	} );

	next();
}
