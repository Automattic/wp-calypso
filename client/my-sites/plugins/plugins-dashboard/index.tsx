import { recordTracksEvent } from '@automattic/calypso-analytics';
import pagejs from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPlugins from 'calypso/components/data/query-plugins';
import Layout from 'calypso/layout/multi-sites-dashboard';
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
	getPlugins,
	isRequestingForAllSites,
	getPluginsWithUpdateStatuses,
} from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { getAllPlugins as getAllWporgPlugins } from 'calypso/state/plugins/wporg/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import { PluginActionName, PluginActions, Site } from '../hooks/types';
import { withShowPluginActionDialog, DialogCallback } from '../hooks/use-show-plugin-action-dialog';
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
	const sites = useSelector( ( state ) => getSelectedOrAllSitesWithPlugins( state ) );
	const siteIds = siteObjectsToSiteIds( sites ) ?? [];
	const wporgPlugins = useSelector( ( state ) => getAllWporgPlugins( state ) );
	const isLoading = useSelector( ( state ) => isRequestingForAllSites( state ) );
	const allPlugins = useSelector( ( state ) => getPlugins( state, siteIds, 'all' ) ).map(
		( plugin: Plugin ) => {
			const pluginData = wporgPlugins?.[ plugin.slug ];
			return Object.assign( {}, plugin, pluginData ) as Plugin;
		}
	);
	const currentPlugins = useSelector( ( state ) =>
		getPluginsWithUpdateStatuses( state, allPlugins )
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

		recordTracksEvent( 'Clicked Activate Plugin(s)' );
		doActionOverSelected( 'activating', activatePlugin );
	};

	const removeSelectedWithJetpack = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Remove Plugin(s) and Remove Jetpack' );

		doActionOverSelected( 'removing', ( siteId: number, plugin: Plugin ) => {
			removePlugin( siteId, plugin );
		} );
	};

	const removeSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Remove Plugin(s)' );
		doActionOverSelected( 'removing', removePlugin );
	};

	const deactivateAndDisconnectSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Deactivate Plugin(s) and Disconnect Jetpack' );

		doActionOverSelected( 'deactivating', ( siteId: number, plugin: Plugin ) => {
			deactivatePlugin( siteId, plugin );
		} );
	};

	const deactivateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Deactivate Plugin(s)' );
		doActionOverSelected( 'deactivating', deactivatePlugin );
	};

	const updatePlugin = ( selectedPlugin: Plugin ) => {
		handleUpdatePlugins( [ selectedPlugin ], updatePluginAction, [] );
		removePluginStatuses();
	};

	const updateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Update Plugin(s)' );
		doActionOverSelected( 'updating', updatePlugin );
	};

	const setAutoupdateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Enable Autoupdate Plugin(s)' );
		doActionOverSelected( 'enablingAutoupdates', enableAutoupdatePlugin );
	};

	const unsetAutoupdateSelected = ( accepted: boolean ) => {
		if ( ! accepted ) {
			return;
		}

		recordTracksEvent( 'Clicked Disable Autoupdate Plugin(s)' );
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

				<DocumentHead title={ dashboardTitle } />

				<PluginsListDataViews
					pluginSlug={ pluginSlug }
					currentPlugins={ currentPlugins }
					initialSearch={ searchTerm }
					isLoading={ isLoading }
					onSearch={ doSearch }
					bulkActionDialog={ bulkActionDialog }
				/>
			</LayoutColumn>
			{ pluginSlug && (
				<LayoutColumn className="site-preview-pane" wide>
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
				</LayoutColumn>
			) }
		</Layout>
	);
};

export default withShowPluginActionDialog( UrlSearch( PluginsDashboard ) );
