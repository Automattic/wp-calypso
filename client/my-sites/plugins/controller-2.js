import { includes } from 'lodash';
// import page from 'page';
import { createElement } from 'react';
import { BASE_STALE_TIME, WPORG_CACHE_KEY } from 'calypso/data/marketplace/constants';
import { getPluginsListKey } from 'calypso/data/marketplace/utils';
import { getSiteFragment, sectionify } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import { fetchPluginsList } from 'calypso/lib/wporg';
// import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { createQueryClient } from 'calypso/state/query-client';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { ALLOWED_CATEGORIES } from './categories/use-categories';
import PlanSetup from './jetpack-plugins-setup';
import LoggedOutComponent from './logged-out';
import PluginListComponent from './main';
import PluginDetails from './plugin-details';
import PluginEligibility from './plugin-eligibility';
// import PluginUpload from './plugin-upload';

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

	// if ( search ) {
	// 	gaRecordEvent( 'Plugins', 'Search', 'Search term', search );
	// }
}

// The plugin browser can be rendered by the `/plugins/:plugin/:site_id?` route. In that case,
// the `:plugin` param is actually the side ID or category.
function getCategoryForPluginsBrowser( context ) {
	if ( context.params.plugin && includes( ALLOWED_CATEGORIES, context.params.plugin ) ) {
		return context.params.plugin;
	}

	return context.params.category;
}

function getProps( context ) {
	const searchTerm = context.query.s;
	const category = getCategoryForPluginsBrowser( context );

	const props = {
		path: context.path,
		category,
		search: searchTerm,
	};
	return props;
}

function renderPluginsBrowser( context ) {
	const props = {
		...getProps( context ),
		...context.plugins,
	};

	context.primary = (
		<LoggedOutComponent { ...props } queryClient={ context.queryClient } store={ context.store } />
	);
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

export function browsePlugins( context, next ) {
	renderPluginsBrowser( context );
	next();
}

// export function upload( context, next ) {
// 	context.primary = <PluginUpload />;
// 	next();
// }

// export function jetpackCanUpdate( context, next ) {
// 	const selectedSites = getSelectedOrAllSitesWithPlugins( context.store.getState() );
// 	let redirectToPlugins = false;

// 	if ( 'updates' === context.params.pluginFilter && selectedSites.length ) {
// 		redirectToPlugins = ! some( selectedSites, function ( site ) {
// 			return site && site.jetpack && site.canUpdateFiles;
// 		} );

// 		if ( redirectToPlugins ) {
// 			if ( context.params && context.params.site_id ) {
// 				page.redirect( `/plugins/manage/${ context.params.site_id }` );
// 				return;
// 			}
// 			page.redirect( '/plugins/manage' );
// 			return;
// 		}
// 	}
// 	next();
// }

// export function scrollTopIfNoHash( context, next ) {
// 	if ( typeof window !== 'undefined' && ! window.location.hash ) {
// 		window.scrollTo( 0, 0 );
// 	}
// 	next();
// }

function prefetchPluginsData( queryClient, options, infinite ) {
	const queryType = infinite ? 'fetchInfiniteQuery' : 'fetchQuery';
	const isFeatured = 'featured' === options.category;
	const isPaid = 'paid' === options.category;
	const cacheKeys = {
		featured: 'plugins-featured-list',
		paid: [ 'wpcom-plugins', 'all' + 'undefined' + 'enabled' ],
	};

	const cacheKey =
		cacheKeys[ options.category ] || getPluginsListKey( WPORG_CACHE_KEY, options, infinite );

	return queryClient[ queryType ](
		cacheKey,
		() => {
			const featuredPluginsApiBase = '/plugins/featured';
			const pluginsApiNamespace = 'wpcom/v2';
			const plugisApiBase = '/marketplace/products';
			if ( isFeatured ) {
				return wpcom.req.get( {
					path: featuredPluginsApiBase,
					apiNamespace: pluginsApiNamespace,
				} );
			}
			if ( isPaid ) {
				return wpcom.req.get(
					{
						path: plugisApiBase,
						apiNamespace: pluginsApiNamespace,
					},
					{
						type: 'all',
					}
				);
			}
			return fetchPluginsList( {
				pageSize: options.pageSize,
				page: options.page,
				category: options.category,
				locale: options.locale || 'en',
				// tag: options.tag && ! search ? options.tag : null,
			} );
		},
		{
			enabled: true,
			staleTime: BASE_STALE_TIME,
			refetchOnMount: false,
		}
	);
}

export async function fetchPlugins( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
		locale: 'en',
	};

	const queryClient = await createQueryClient();
	const queryCache = queryClient.getQueryCache();
	queryCache.clear();

	await Promise.all( [
		// prefetchPluginsData( queryClient, { ...options, category: 'paid' } ),
		prefetchPluginsData( queryClient, { ...options, category: 'featured' } ),
		prefetchPluginsData( queryClient, { ...options, category: 'popular' } ),

		// prefetchPluginsData( queryClient, { ...options, category: '' }, true ),
		prefetchPluginsData( queryClient, { ...options, category: 'paid' } ),
		// prefetchPluginsData( queryClient, { ...options, category: 'featured' }, true ),
		// prefetchPluginsData( queryClient, { ...options, category: 'popular' }, true ),
	] );

	context.queryClient = queryClient;

	next();
}

export async function fetchCategoryPlugins( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
		locale: 'en',
	};

	const queryClient = await createQueryClient();

	await prefetchPluginsData( queryClient, options, true );

	context.queryClient = queryClient;

	next();
}
