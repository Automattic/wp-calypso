import { recordTracksEvent } from '@automattic/calypso-analytics';
import pagejs from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPlugins from 'calypso/components/data/query-plugins';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutColumn from 'calypso/layout/multi-sites-dashboard/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import UrlSearch from 'calypso/lib/url-search';
import { handleUpdatePlugins, siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { useSelector, useDispatch } from 'calypso/state';
import {
	activatePlugin,
	deactivatePlugin,
	disableAutoupdatePlugin,
	enableAutoupdatePlugin,
	removePlugin,
	updatePlugin as updatePluginAction,
} from 'calypso/state/plugins/installed/actions';
import {
	getSiteObjectsWithPlugin,
	getPlugins,
	isRequestingForAllSites,
	getPluginsWithUpdateStatuses,
} from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { getAllPlugins as getAllWporgPlugins } from 'calypso/state/plugins/wporg/selectors';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { PluginActionName, PluginActions, Site } from '../hooks/types';
import { withShowPluginActionDialog, DialogCallback } from '../hooks/use-show-plugin-action-dialog';
import PluginAvailableOnSitesList from '../plugin-management-v2/plugin-details-v2/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from '../plugin-management-v2/plugin-details-v2/sites-with-installed-plugin-list';
import PluginsListDataViews from '../plugins-list/plugins-list-dataviews';
import type { Plugin } from 'calypso/state/plugins/installed/types';

import './style.scss';

type ActionCallbacks = Record< PluginActionName, DialogCallback >;

interface PluginsDashboardProps {
	pluginSlug: string;
	doSearch: ( query: string ) => void; // prop coming from UrlSearch
	search: string | undefined;
	showPluginActionDialog: (
		actionName: PluginActionName,
		selectedPlugins: Plugin[],
		sites: Site[],
		selectedActionCallback: ( accepted: boolean ) => void
	) => void;
	fullPlugin: object;
	showPlaceholder: boolean;
	isMarketplaceProduct: boolean;
	isWpcom: boolean;
	queryParams: {
		page: number;
		perPage: number;
		search: string;
	};
}

export function showPluginsDashboardPage( route: string ) {
	const currentParams = new URL( window.location.href ).searchParams;
	const newUrl = new URL( route, window.location.origin );

	const supportedParams = [ 'page', 'per-page', 'search', 'status', 'siteType' ];
	supportedParams.forEach( ( param ) => {
		if ( currentParams.has( param ) ) {
			const value = currentParams.get( param );
			if ( value ) {
				newUrl.searchParams.set( param, value );
			}
		}
	} );

	pagejs.show( newUrl.toString().replace( window.location.origin, '' ) );
}

const PluginsDashboard = ( {
	pluginSlug,
	doSearch,
	search: searchTerm,
	showPluginActionDialog,
}: PluginsDashboardProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ selectedPlugins, setSelectedPlugins ] = useState< Plugin[] >( [] );
	const allSites = useSelector( ( state ) => getSelectedOrAllSites( state ) );
	const sites = useSelector( ( state ) => getSelectedOrAllSitesWithPlugins( state ) );
	const siteIds = siteObjectsToSiteIds( sites ) ?? [];
	const wporgPlugins = useSelector( ( state ) => getAllWporgPlugins( state ) );
	const isLoading = useSelector(
		( state ) => isRequestingForAllSites( state ) || isRequestingSites( state )
	);
	const allPlugins = useSelector( ( state ) => getPlugins( state, siteIds, 'all' ) ).map(
		( plugin: Plugin ) => {
			const pluginData = wporgPlugins?.[ plugin.slug ];
			return Object.assign( {}, plugin, pluginData ) as Plugin;
		}
	);
	const currentPlugins = useSelector( ( state ) =>
		getPluginsWithUpdateStatuses( state, allPlugins )
	);
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, pluginSlug )
	);
	const sitesToShow = allSites.filter( ( item ) => item && ! item?.options?.is_domain_only );
	const sitesWithoutPlugin = sitesToShow.filter(
		( site ) => ! sitesWithPlugin.find( ( siteWithPlugin ) => siteWithPlugin?.ID === site?.ID )
	);
	const dashboardTitle = pluginSlug ? `Manage ${ pluginSlug } in all sites` : 'Manage Plugins';

	const doActionOverSelected = (
		actionName: string,
		action: ( siteId: number, plugin: Plugin ) => void
	) => {
		const isDeactivatingOrRemovingAndJetpackSelected = ( { slug }: Plugin ) =>
			[ 'deactivating', 'activating', 'removing' ].includes( actionName ) && 'jetpack' === slug;

		removePluginStatuses( 'completed', 'error', 'up-to-date' );

		const pluginAndSiteObjects = selectedPlugins
			?.filter( ( plugin: Plugin ) => ! isDeactivatingOrRemovingAndJetpackSelected( plugin ) )
			.map( ( p: Plugin ) => {
				return Object.keys( p.sites ).map( ( siteId ) => {
					const site = sites.find( ( s ) => s?.ID === parseInt( siteId ) );
					return {
						plugin: p,
						site,
					};
				} );
			} ) // list of plugins -> list of plugin+site objects
			.flat(); // flatten the list into one big list of plugin+site objects

		pluginAndSiteObjects?.forEach( ( { plugin, site } ) =>
			dispatch( action( site.ID || 0, plugin ) )
		);

		const pluginSlugs = [
			...new Set( pluginAndSiteObjects?.map( ( { plugin } ) => plugin.slug ) ),
		].join( ',' );

		const siteIds = [ ...new Set( pluginAndSiteObjects?.map( ( { site } ) => site?.ID ) ) ].join(
			','
		);

		recordTracksEvent( 'calypso_plugins_bulk_action_execute', {
			action: actionName,
			plugins: pluginSlugs,
			sites: siteIds,
		} );
	};

	const activateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'activating', activatePlugin );
	};

	const removeSelectedWithJetpack = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'removing', ( siteId: number, plugin: Plugin ) => {
			removePlugin( siteId, plugin );
		} );
	};

	const removeSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'removing', removePlugin );
	};

	const deactivateAndDisconnectSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'deactivating', ( siteId: number, plugin: Plugin ) => {
			deactivatePlugin( siteId, plugin );
		} );
	};

	const deactivateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'deactivating', deactivatePlugin );
	};

	const updateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'updating', ( siteId: number, plugin: Plugin ) => {
			handleUpdatePlugins( [ plugin ], updatePluginAction, [] );
			removePluginStatuses();
		} );
	};

	const setAutoupdateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'enablingAutoupdates', enableAutoupdatePlugin );
	};

	const unsetAutoupdateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'disablingAutoupdates', disableAutoupdatePlugin );
	};

	/** END BULK ACTION DIALOG CALLBACKS */
	const bulkActionDialog = ( actionName: string, selectedPlugins: Plugin[] ) => {
		const isJetpackIncluded = selectedPlugins.some( ( plugin ) => plugin.slug === 'jetpack' );

		const ALL_ACTION_CALLBACKS: ActionCallbacks = {
			[ PluginActions.ACTIVATE ]: activateSelected,
			[ PluginActions.DEACTIVATE ]: isJetpackIncluded
				? deactivateAndDisconnectSelected
				: deactivateSelected,
			[ PluginActions.REMOVE ]: isJetpackIncluded ? removeSelectedWithJetpack : removeSelected,
			[ PluginActions.UPDATE ]: updateSelected,
			[ PluginActions.ENABLE_AUTOUPDATES ]: setAutoupdateSelected,
			[ PluginActions.DISABLE_AUTOUPDATES ]: unsetAutoupdateSelected,
		};

		if ( actionName === PluginActions.UPDATE ) {
			//filter out sites that don't have an update available
			selectedPlugins = selectedPlugins.map( ( plugin ) => {
				const filteredSites = Object.fromEntries(
					Object.entries( plugin.sites ).filter( ( [ , site ] ) => site.update?.new_version )
				);
				return { ...plugin, sites: filteredSites };
			} );
		}

		setSelectedPlugins( selectedPlugins );

		const selectedActionCallback = ALL_ACTION_CALLBACKS[ actionName as PluginActionName ];
		showPluginActionDialog(
			actionName as PluginActionName,
			selectedPlugins,
			sites as Site[],
			selectedActionCallback
		);
	};

	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! pluginSlug && 'preview-hidden'
			) }
			wide
			title={ dashboardTitle }
			disableGuidedTour
		>
			<DocumentHead title={ dashboardTitle } />
			<PageViewTracker
				path={ pluginSlug ? `/plugins/manage/sites/${ pluginSlug }` : '/plugins/manage/sites' }
				title="Plugins Dashboard"
			/>
			<QueryPlugins />
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ false }>
					<LayoutHeader>
						<Title>{ translate( 'Manage Plugins' ) }</Title>
						<Subtitle>{ translate( 'Manage plugins installed on all sites' ) }</Subtitle>
						<Actions>
							<Button href="/plugins">{ translate( 'Browse plugins' ) }</Button>
						</Actions>
					</LayoutHeader>
				</LayoutTop>

				<PluginsListDataViews
					pluginSlug={ pluginSlug }
					currentPlugins={ currentPlugins }
					initialSearch={ searchTerm }
					isLoading={ isLoading }
					onSearch={ doSearch }
					bulkActionDialog={ bulkActionDialog }
				/>
			</LayoutColumn>
			{ pluginSlug && sitesWithPlugin.length && allPlugins.length > 0 && (
				<LayoutColumn className="plugin-manage-sites-pane" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							<Title>
								{ translate( `Manage %(pluginSlug)s in all sites`, { args: { pluginSlug } } ) }
							</Title>
							<Actions>
								<Button href="/plugins/manage/sites">{ translate( 'Close' ) }</Button>
							</Actions>
						</LayoutHeader>
					</LayoutTop>
					<LayoutBody>
						<SitesWithInstalledPluginsList
							isWpCom
							sites={ sitesWithPlugin }
							isLoading={ isLoading }
							plugin={ allPlugins.find( ( plugin ) => plugin.slug === pluginSlug ) }
						/>

						<PluginAvailableOnSitesList
							sites={ sitesWithoutPlugin }
							isLoading={ isLoading }
							plugin={ allPlugins.find( ( plugin ) => plugin.slug === pluginSlug ) }
						/>
					</LayoutBody>
				</LayoutColumn>
			) }
		</Layout>
	);
};

export default withShowPluginActionDialog( UrlSearch( PluginsDashboard ) );
