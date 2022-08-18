import { some } from 'lodash';
import page from 'page';
import { createElement } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { getSiteFragment, sectionify } from 'calypso/lib/route';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PlanSetup from './jetpack-plugins-setup';
import PluginListComponent from './main';
import PluginDetails from './plugin-details';
import PluginEligibility from './plugin-eligibility';
import PluginUpload from './plugin-upload';
import PluginBrowser from './plugins-browser';
import PluginsCategoryResultsPage from './plugins-category-results-page';
import PluginsSearchResultPage from './plugins-search-results-page';

function renderSinglePlugin( context, siteUrl ) {
	const pluginSlug = decodeURIComponent( context.params.plugin );

	// Render single plugin component
	context.primary = createElement( PluginDetails, {
		path: context.path,
		pluginSlug,
		siteUrl,
	} );
}

function renderPluginList( context, basePath ) {
	const search = context.query.s;

	context.primary = createElement( PluginListComponent, {
		path: basePath,
		context,
		filter: context.params.pluginFilter,
		search,
	} );

	if ( search ) {
		gaRecordEvent( 'Plugins', 'Search', 'Search term', search );
	}
}

function renderPluginsBrowser( context ) {
	context.primary = createElement( PluginBrowser, {
		path: context.path,
	} );
}

function renderPluginsSearchPage( context ) {
	const searchTerm = context.query.s;

	context.primary = createElement( PluginsSearchResultPage, {
		path: context.path,
		search: searchTerm,
	} );
}

function renderPluginsCategoriesPage( context, next ) {
	const category = context.params.category;

	context.primary = createElement( PluginsCategoryResultsPage, {
		path: context.path,
		category,
	} );

	next();
}

export function renderPluginWarnings( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const pluginSlug = decodeURIComponent( context.params.plugin );

	context.primary = createElement( PluginEligibility, {
		siteSlug: site.slug,
		pluginSlug,
	} );
	next();
}

export function renderProvisionPlugins( context, next ) {
	context.primary = createElement( PlanSetup, {
		forSpecificPlugin: context.query.only || false,
	} );
	next();
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

export function redirectOnSearchQuery( context, next ) {
	const searchTerm = context.query.s;
	const site = context.params.site;

	if ( searchTerm ) {
		const redirectionUrl = `/plugins/${ site || '' }?s=${ searchTerm }`;
		page.redirect( redirectionUrl );
	}

	next();
}

// The plugin browser can be rendered by the `/plugins/:plugin/:site_id?` route.
// If the "plugin" part of the route is actually a site,
// render the plugin browser for that site. Otherwise render plugin.
export function browsePluginsOrPlugin( context, next ) {
	const siteUrl = getSiteFragment( context.path );
	if (
		( context.params.plugin && siteUrl && context.params.plugin === siteUrl.toString() ) ||
		context.query?.s
	) {
		browsePlugins( context, next );
		return;
	}

	plugin( context, next );
}

export function browsePluginsByCategory( context, next ) {
	renderPluginsCategoriesPage( context, next );
}

export function browsePlugins( context, next ) {
	const searchTerm = context.query.s;

	if ( searchTerm ) {
		renderPluginsSearchPage( context );

		return next();
	}

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

export function scrollTopIfNoHash( context, next ) {
	if ( typeof window !== 'undefined' && ! window.location.hash ) {
		window.scrollTo( 0, 0 );
	}
	next();
}
