import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { pluginsManageRoute } from '../../app/router/plugins';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getViewFilteredByUpdates } from '../utils/update-filters';
import { getActions } from './actions';
import { PluginsHeaderActions } from './components/plugins-header-actions';
import { fields } from './fields';
import { mapApiPluginsToDataViewPlugins } from './utils';
import { defaultView } from './views';
import type { PluginListRow } from './types';

import './style.scss';

export default function PluginsList() {
	const { queries } = useAppContext();
	const { data: sitesPlugins, isLoading: isLoadingPlugins } = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );
	const searchParams = pluginsManageRoute.useSearch();
	const actions = getActions();
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'plugins-manage',
		defaultView,
		queryParams: searchParams,
	} );
	const data = useMemo(
		() => mapApiPluginsToDataViewPlugins( sites, sitesPlugins ),
		[ sites, sitesPlugins ]
	);

	const { data: filteredPlugins, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, fields );
	}, [ data, view ] );
	const { data: marketplacePlugins, isLoading: isLoadingMarketplacePlugins } = useQuery(
		marketplacePluginsQuery()
	);
	const { data: marketplaceSearch, isLoading: isLoadingMarketplaceSearch } = useQuery(
		marketplaceSearchQuery( {
			perPage: Number( view.perPage ),
			slugs: filteredPlugins.map( ( plugin ) => plugin.slug ),
		} )
	);

	const iconBySlug = useMemo( () => {
		const marketplacePluginsBySlug = new Map( Object.entries( marketplacePlugins?.results || {} ) );

		const marketplaceSearchBySlug = ( marketplaceSearch?.data.results || [] ).reduce(
			( acc, { fields } ) => {
				acc.set( fields.slug, fields );
				return acc;
			},
			new Map< string, MarketplaceSearchResult[ 'fields' ] >()
		);

		return filteredPlugins.reduce( ( acc, { slug } ) => {
			let icon;
			if ( marketplacePluginsBySlug.has( slug ) ) {
				icon = marketplacePluginsBySlug.get( slug )?.icons;
			} else if ( marketplaceSearchBySlug.has( slug ) ) {
				icon = marketplaceSearchBySlug.get( slug )?.plugin?.icons;
			}

			acc.set( slug, icon );

			return acc;
		}, new Map< string, PluginListRow[ 'icon' ] >() );
	}, [ filteredPlugins, marketplacePlugins, marketplaceSearch ] );

	const filteredPluginsWithIcon = useMemo( () => {
		return filteredPlugins.map( ( plugin ) => {
			return {
				...plugin,
				icon: iconBySlug?.get( plugin.slug ),
			};
		} );
	}, [ filteredPlugins, iconBySlug ] );

	const updateCount = useMemo( () => {
		return data.filter( ( plugin ) => {
			return ! plugin.isManaged && [ 'some', 'all' ].includes( plugin.hasUpdate );
		} ).length;
	}, [ data ] );

	const handleFilterUpdates = useCallback( () => {
		if ( updateCount <= 0 ) {
			return;
		}

		updateView( getViewFilteredByUpdates( view, 'updateAvailable', 2 ) );
	}, [ updateCount, updateView, view ] );

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Manage plugins' ) }
					description={ __( 'Install, activate, and manage plugins across your sites.' ) }
				/>
			}
			notices={ <OptInWelcome tracksContext="plugins" /> }
		>
			<DataViewsCard>
				<DataViews
					isLoading={
						isLoadingPlugins ||
						isLoadingMarketplacePlugins ||
						isLoadingMarketplaceSearch ||
						isLoadingSites
					}
					data={ filteredPluginsWithIcon ?? [] }
					fields={ fields }
					view={ view }
					onChangeView={ updateView }
					onResetView={ resetView }
					header={
						<PluginsHeaderActions
							updateCount={ updateCount }
							onFilterUpdates={ handleFilterUpdates }
						/>
					}
					defaultLayouts={ { table: {} } }
					actions={ actions }
					getItemId={ ( item: PluginListRow ) => item.id }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
