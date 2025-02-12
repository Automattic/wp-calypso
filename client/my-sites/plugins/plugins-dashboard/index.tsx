import { recordTracksEvent } from '@automattic/calypso-analytics';
import { hasMarketplaceProduct } from '@automattic/calypso-products';
import pagejs from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import A4APluginsJetpackBanner from 'calypso/a8c-for-agencies/sections/plugins/plugins-jetpack-banner';
import QueryJetpackSitesFeatures from 'calypso/components/data/query-jetpack-sites-features';
import QueryPlugins from 'calypso/components/data/query-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { useWPCOMPluginsList } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import Layout from 'calypso/layout/hosting-dashboard';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutColumn from 'calypso/layout/hosting-dashboard/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/layout/hosting-dashboard/header';
import LayoutTop from 'calypso/layout/hosting-dashboard/top';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import UrlSearch from 'calypso/lib/url-search';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
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
import { getProductsList } from 'calypso/state/products-list/selectors';
import getSelectedOrAllSitesWithJetpackPlugin from 'calypso/state/selectors/get-selected-or-all-sites-with-jetpack-plugin';
import getSites from 'calypso/state/selectors/get-sites';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { PluginActionName, PluginActions, Site } from '../hooks/types';
import { withShowPluginActionDialog } from '../hooks/use-show-plugin-action-dialog';
import PluginAvailableOnSitesList from '../plugin-management-v2/plugin-details-v2/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from '../plugin-management-v2/plugin-details-v2/sites-with-installed-plugin-list';
import { PluginComponentProps } from '../plugin-management-v2/types';
import PluginsListDataViews from '../plugins-list/plugins-list-dataviews';
import type { SiteDetails } from '@automattic/data-stores';
import type { Plugin } from 'calypso/state/plugins/installed/types';
import './style.scss';

interface PluginActionCallback {
	( plugins: Plugin[] ): ( accepted: boolean ) => void;
}

type ActionCallbacks = Record< PluginActionName, PluginActionCallback >;

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
	const isJetpackCloudOrA8CForAgencies = isJetpackCloud() || isA8CForAgencies();
	const allSites = useSelector( ( state ) =>
		isA8CForAgencies() ? getSelectedOrAllSitesWithJetpackPlugin( state ) : getSites( state )
	);
	const siteIds = siteObjectsToSiteIds( allSites ) ?? [];
	const wporgPlugins = useSelector( ( state ) => getAllWporgPlugins( state ) );
	const isLoading = useSelector(
		( state ) => isRequestingForAllSites( state ) || isRequestingSites( state )
	);
	const productsList = useSelector( ( state ) => getProductsList( state ) );
	const { data: dotComPlugins }: { data: Plugin[] | undefined } = useWPCOMPluginsList( 'all' );
	const allPlugins = useSelector( ( state ) =>
		getPlugins( state, siteIds, 'all' ).map( ( plugin: PluginComponentProps ) => {
			let dotComPluginData: PluginComponentProps | undefined;
			if ( dotComPlugins ) {
				dotComPluginData = dotComPlugins.find(
					( dotComPlugin ) => dotComPlugin.slug === plugin.slug
				);
				if ( dotComPluginData ) {
					dotComPluginData.isMarketplaceProduct = hasMarketplaceProduct(
						productsList,
						plugin.slug
					);
				}
			}
			const dotOrgPluginData = wporgPlugins?.[ plugin.slug ];
			return Object.assign( {}, plugin, dotOrgPluginData, dotComPluginData ) as Plugin;
		} )
	);
	const currentPlugins = useSelector( ( state ) =>
		getPluginsWithUpdateStatuses( state, allPlugins )
	);
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, pluginSlug )
	);
	allSites.sort( orderByAtomic );
	const sitesToShow = allSites.filter(
		( item ): item is SiteDetails =>
			item !== null &&
			item !== undefined &&
			! item?.options?.is_domain_only &&
			! item?.options?.is_wpforteams_site
	);

	const sitesWithoutPluginAvailable = sitesToShow.filter(
		( site ) =>
			! sitesWithPlugin.find( ( siteWithPlugin ) => siteWithPlugin?.ID === site?.ID ) &&
			! ( isJetpackCloudOrA8CForAgencies && hasMarketplaceProduct( productsList, pluginSlug ) )
	);

	const doActionOverSelected = (
		actionName: string,
		action: ( siteId: number, plugin: Plugin ) => void,
		selectedPlugins: Plugin[]
	) => {
		const isDeactivatingOrRemovingAndJetpackSelected = ( { slug }: Plugin ) =>
			[ 'deactivating', 'activating', 'removing' ].includes( actionName ) && 'jetpack' === slug;

		removePluginStatuses( 'completed', 'error', 'up-to-date' );

		const pluginAndSiteObjects = selectedPlugins
			?.filter( ( plugin: Plugin ) => ! isDeactivatingOrRemovingAndJetpackSelected( plugin ) )
			.map( ( p: Plugin ) => {
				return Object.keys( p.sites ).map( ( siteId ) => {
					const site = allSites.find( ( s ) => s?.ID === parseInt( siteId ) );
					return {
						plugin: p,
						site,
					};
				} );
			} ) // list of plugins -> list of plugin+site objects
			.flat() // flatten the list into one big list of plugin+site objects
			.filter(
				( obj ): obj is { plugin: Plugin; site: SiteDetails } =>
					obj.site !== null && obj.site !== undefined
			);

		pluginAndSiteObjects?.forEach( ( { plugin, site } ) => {
			return dispatch( action( site.ID, plugin ) );
		} );

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

	const activateSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'activating', activatePlugin, plugins );
	};

	const removeSelectedWithJetpack = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected(
			'removing',
			( siteId: number, plugin: Plugin ) => {
				removePlugin( siteId, plugin );
			},
			plugins
		);
	};

	const removeSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'removing', removePlugin, plugins );
	};

	const deactivateAndDisconnectSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected(
			'deactivating',
			( siteId: number, plugin: Plugin ) => {
				deactivatePlugin( siteId, plugin );
			},
			plugins
		);
	};

	const deactivateSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'deactivating', deactivatePlugin, plugins );
	};

	const updateSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'updating', updatePluginAction, plugins );
	};

	const setAutoupdateSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'enablingAutoupdates', enableAutoupdatePlugin, plugins );
	};

	const unsetAutoupdateSelected = ( plugins: Plugin[] ) => ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		doActionOverSelected( 'disablingAutoupdates', disableAutoupdatePlugin, plugins );
	};

	/** END BULK ACTION DIALOG CALLBACKS */
	const bulkActionDialog = ( actionName: string, selectedPlugins: Plugin[] ) => {
		const isJetpackIncluded = selectedPlugins.some( ( plugin ) => plugin.slug === 'jetpack' );

		let pluginsToProcess = selectedPlugins;
		if ( actionName === PluginActions.UPDATE ) {
			//filter out sites that don't have an update available
			pluginsToProcess = selectedPlugins.map( ( plugin ) => {
				const filteredSites = Object.fromEntries(
					Object.entries( plugin.sites ).filter( ( [ , site ] ) => site.update?.new_version )
				);
				return { ...plugin, sites: filteredSites };
			} );
		}

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

		const selectedActionCallback = ALL_ACTION_CALLBACKS[ actionName as PluginActionName ];
		showPluginActionDialog(
			actionName as PluginActionName,
			pluginsToProcess,
			allSites as Site[],
			selectedActionCallback( pluginsToProcess )
		);
	};

	const selectedPlugin = pluginSlug
		? allPlugins.find( ( plugin ) => plugin.slug === pluginSlug )
		: undefined;

	const dashboardTitle = selectedPlugin
		? `Manage ${ selectedPlugin.name } in all sites`
		: 'Manage Plugins';
	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! pluginSlug && 'preview-hidden'
			) }
			wide
			title={ dashboardTitle }
			sidebarNavigation={
				isJetpackCloudOrA8CForAgencies && (
					<SidebarNavigation sectionTitle={ translate( 'Manage Plugins' ) } />
				)
			}
		>
			<PageViewTracker
				path={ pluginSlug ? `/plugins/manage/sites/${ pluginSlug }` : '/plugins/manage/sites' }
				title="Plugins Dashboard"
			/>
			<QueryJetpackSitesFeatures />
			<QueryPlugins />
			<QueryProductsList />
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ false }>
					{ isA8CForAgencies() && <A4APluginsJetpackBanner /> }
					<LayoutHeader>
						<Title>{ translate( 'Manage Plugins' ) }</Title>
						{ ! pluginSlug && (
							<Subtitle>{ translate( 'Manage all your plugins in one place' ) }</Subtitle>
						) }
						{ ! pluginSlug && ! isJetpackCloudOrA8CForAgencies && (
							<Actions>
								<Button href="/plugins">{ translate( 'Browse plugins' ) }</Button>
							</Actions>
						) }
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
			{ selectedPlugin && sitesWithPlugin.length && allPlugins.length > 0 && (
				<LayoutColumn className="plugin-manage-sites-pane" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							<Title>
								{ selectedPlugin.icon && (
									<img
										width={ 24 }
										height={ 24 }
										src={ selectedPlugin.icon }
										alt={ selectedPlugin.name }
									/>
								) }
								{ `${ selectedPlugin.name }` }
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
							plugin={ selectedPlugin }
						/>

						<PluginAvailableOnSitesList
							sites={ sitesWithoutPluginAvailable }
							isLoading={ isLoading }
							plugin={ selectedPlugin }
						/>
					</LayoutBody>
				</LayoutColumn>
			) }
		</Layout>
	);
};

export default withShowPluginActionDialog( UrlSearch( PluginsDashboard ) );

function orderByAtomic(
	siteA: SiteDetails | null | undefined,
	siteB: SiteDetails | null | undefined
): number {
	const { is_wpcom_atomic: siteAAtomic } = siteA?.options ?? {};
	const { is_wpcom_atomic: siteBAtomic } = siteB?.options ?? {};

	if ( siteAAtomic === siteBAtomic ) {
		return 0;
	}

	if ( siteAAtomic && ! siteBAtomic ) {
		return -1;
	}

	return 1;
}
