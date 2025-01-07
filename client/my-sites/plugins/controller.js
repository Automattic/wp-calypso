import page from '@automattic/calypso-router';
import { includes, some } from 'lodash';
import { createElement } from 'react';
import { PluginsScheduledUpdates } from 'calypso/blocks/plugins-scheduled-updates';
import { PluginsScheduledUpdatesMultisite } from 'calypso/blocks/plugins-scheduled-updates-multisite';
import { redirectLoggedOut } from 'calypso/controller';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { navigate } from 'calypso/lib/navigate';
import { getSiteFragment, sectionify } from 'calypso/lib/route';
import { navigation, sites } from 'calypso/my-sites/controller';
import PluginsSidebar from 'calypso/my-sites/plugins/sidebar';
import { isUserLoggedIn, getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { getShouldShowCollapsedGlobalSidebar } from 'calypso/state/global-sidebar/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { isSiteOnECommerceTrial, getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteAdminUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ALLOWED_CATEGORIES } from './categories/use-categories';
import { UNLISTED_PLUGINS } from './constants';
import PlanSetup from './jetpack-plugins-setup';
import { MailPoetUpgradePage } from './mailpoet-upgrade';
import PluginListComponent from './main';
import PluginDetails from './plugin-details';
import PluginEligibility from './plugin-eligibility';
import PluginNotFound from './plugin-not-found';
import PluginBrowser from './plugins-browser';
import PluginsDashboard from './plugins-dashboard';
import { RelatedPluginsPage } from './related-plugins-page';
function renderSinglePlugin( context, siteUrl ) {
	const pluginSlug = decodeURIComponent( context.params.plugin );

	if ( UNLISTED_PLUGINS.includes( pluginSlug ) ) {
		// Render empty view
		context.primary = createElement( PluginNotFound );
	} else {
		// Render single plugin component
		context.primary = createElement( PluginDetails, {
			path: context.path,
			pluginSlug,
			siteUrl,
		} );
	}
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

// The plugin browser can be rendered by the `/plugins/:plugin/:site_id?` route. In that case,
// the `:plugin` param is actually the side ID or category.
export function getCategoryForPluginsBrowser( context ) {
	if ( context.params.plugin && includes( ALLOWED_CATEGORIES, context.params.plugin ) ) {
		return context.params.plugin;
	}

	return context.params.category;
}

function renderPluginsBrowser( context ) {
	const searchTerm = context.query.s;
	const category = getCategoryForPluginsBrowser( context );

	context.primary = createElement( PluginBrowser, {
		path: context.path,
		category,
		search: searchTerm,
	} );
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

export function redirectMailPoetUpgrade( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	context.primary = createElement( MailPoetUpgradePage, {
		siteId: site.ID,
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

export function renderPluginsDashboard( context, next ) {
	context.primary = <PluginsDashboard pluginSlug={ context.params.slug } />;
	next();
}

export function scheduledUpdates( context, next ) {
	const siteSlug = context?.params?.site_slug;
	const scheduleId = context?.params?.schedule_id;
	const goToScheduledUpdatesList = () => {
		// check if window.location query has multisite
		if ( window?.location.search.includes( 'multisite' ) ) {
			page.show( `/plugins/scheduled-updates` );
		} else {
			page.show( `/plugins/scheduled-updates/${ siteSlug }` );
		}
	};

	if ( ! siteSlug ) {
		sites( context, next );
		return;
	}

	if ( context.params.action === 'logs' && ! scheduleId ) {
		goToScheduledUpdatesList();
		return;
	}

	switch ( context.params.action ) {
		case 'logs':
			context.primary = createElement( PluginsScheduledUpdates, {
				siteSlug,
				scheduleId,
				context: 'logs',
				onNavBack: goToScheduledUpdatesList,
			} );
			break;

		case 'create':
			context.primary = createElement( PluginsScheduledUpdates, {
				siteSlug,
				context: 'create',
				onNavBack: goToScheduledUpdatesList,
			} );
			break;

		case 'edit':
			context.primary = createElement( PluginsScheduledUpdates, {
				siteSlug,
				scheduleId,
				context: 'edit',
				onNavBack: goToScheduledUpdatesList,
			} );
			break;
		case 'notifications':
			context.primary = createElement( PluginsScheduledUpdates, {
				siteSlug,
				context: 'notifications',
				onNavBack: goToScheduledUpdatesList,
			} );
			break;
		case 'list':
		default:
			context.primary = createElement( PluginsScheduledUpdates, {
				siteSlug,
				context: 'list',
				onCreateNewSchedule: () => page.show( `/plugins/scheduled-updates/create/${ siteSlug }` ),
				onNotificationManagement: () =>
					page.show( `/plugins/scheduled-updates/notifications/${ siteSlug }` ),
				onEditSchedule: ( id ) =>
					page.show( `/plugins/scheduled-updates/edit/${ siteSlug }/${ id }` ),
				onShowLogs: ( id ) => page.show( `/plugins/scheduled-updates/logs/${ siteSlug }/${ id }` ),
			} );
			break;
	}

	next();
}

export function scheduledUpdatesMultisite( context, next ) {
	const goToScheduledUpdatesList = () => page.show( `/plugins/scheduled-updates/` );
	const goToScheduleEdit = ( id ) => page.show( `/plugins/scheduled-updates/edit/${ id }` );
	const goToScheduleLogs = ( id, siteSlug ) =>
		page.show( `/plugins/scheduled-updates/logs/${ siteSlug }/${ id }?multisite` );
	const goToScheduleCreate = () => page.show( `/plugins/scheduled-updates/create/` );

	const callbackHandlers = {
		onNavBack: goToScheduledUpdatesList,
		onShowLogs: goToScheduleLogs,
		onEditSchedule: goToScheduleEdit,
		onCreateNewSchedule: goToScheduleCreate,
	};

	switch ( context.params.action ) {
		case 'create':
			context.primary = createElement( PluginsScheduledUpdatesMultisite, {
				context: 'create',
				...callbackHandlers,
			} );
			break;

		case 'edit':
			context.primary = createElement( PluginsScheduledUpdatesMultisite, {
				id: context.params.id,
				context: 'edit',
				...callbackHandlers,
			} );
			break;

		default:
			context.primary = createElement( PluginsScheduledUpdatesMultisite, {
				context: 'list',
				...callbackHandlers,
			} );
			break;
	}

	next();
}

function plugin( context, next ) {
	const siteUrl = getSiteFragment( context.path );
	renderSinglePlugin( context, siteUrl );
	next();
}

export function relatedPlugins( context, next ) {
	const siteUrl = getSiteFragment( context.path );
	const pluginSlug = decodeURIComponent( context.params.plugin );

	context.primary = createElement( RelatedPluginsPage, {
		path: context.path,
		pluginSlug,
		siteUrl,
	} );

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

function waitForState( context ) {
	return new Promise( ( resolve ) => {
		const unsubscribe = context.store.subscribe( () => {
			const state = context.store.getState();

			const siteId = getSelectedSiteId( state );
			if ( ! siteId ) {
				return;
			}

			const currentPlan = getCurrentPlan( state, siteId );
			if ( ! currentPlan ) {
				return;
			}
			unsubscribe();
			resolve();
		} );
		// Trigger a `store.subscribe()` callback
		context.store.dispatch( fetchSitePlans( getSelectedSiteId( context.store.getState() ) ) );
	} );
}

export async function redirectTrialSites( context, next ) {
	// If we have a site ID, we can check the user's plan.
	const siteFragment =
		context.params.site || context.params.site_id || getSiteFragment( context.path );

	if ( siteFragment ) {
		const { store } = context;
		// Make sure state is populated with plan info.
		await waitForState( context );
		const state = store.getState();
		const selectedSite = getSelectedSite( state );

		// If the site is on an ecommerce trial, redirect to the plans page.
		if ( isSiteOnECommerceTrial( state, selectedSite?.ID ) ) {
			page.redirect( `/plans/${ selectedSite.slug }` );
			return false;
		}
	}

	next();
}

/**
 * Middleware to redirect staging sites to the admin interface.
 */
export function redirectStagingSites( context, next ) {
	const { store } = context;
	const state = store.getState();
	const selectedSite = getSelectedSite( state );

	if ( selectedSite && isSiteWpcomStaging( state, selectedSite.ID ) ) {
		const adminInterface = getSiteOption( state, selectedSite.ID, 'wpcom_admin_interface' );
		const siteAdminUrl = getSiteAdminUrl( state, selectedSite.ID );

		if ( selectedSite ) {
			return navigate(
				adminInterface === 'wp-admin' ? siteAdminUrl : `/home/${ selectedSite.slug }`
			);
		}

		return false;
	}

	next();
}

export function scrollTopIfNoHash( context, next ) {
	if ( typeof window !== 'undefined' && ! window.location.hash ) {
		window.scrollTo( 0, 0 );
	}
	next();
}

export function navigationIfLoggedIn( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) && getCurrentUserSiteCount( state ) > 0 ) {
		navigation( context, next );
		return;
	}

	next();
}

export function maybeRedirectLoggedOut( context, next ) {
	const siteFragment =
		context.params.site || context.params.site_id || getSiteFragment( context.path );

	if ( siteFragment ) {
		return redirectLoggedOut( context, next );
	}
	next();
}

export function renderPluginsSidebar( context, next ) {
	const state = context.store.getState();
	const siteUrl = getSiteFragment( context.path );

	if ( ! isUserLoggedIn( state ) ) {
		next();
	}

	if ( ! siteUrl ) {
		context.secondary = (
			<PluginsSidebar
				path={ context.path }
				isCollapsed={ getShouldShowCollapsedGlobalSidebar(
					state,
					undefined,
					context.section.group
				) }
			/>
		);
	}

	next();
}
