import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
	sitesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getActions } from './actions';
import { fields } from './fields';
import { mapApiPluginsToDataViewPlugins } from './utils';
import { defaultView } from './views';
import type { PluginListRow } from './types';

import './style.scss';

export default function PluginsList() {
	const { data: sitesPlugins, isLoading: isLoadingPlugins } = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const actions = getActions();
	const [ view, setView ] = useState( defaultView );
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

	return (
		<PageLayout
			size="large"
			header={ <PageHeader title={ __( 'Manage plugins' ) } /> }
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
					onChangeView={ setView }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					getItemId={ ( item: PluginListRow ) => item.id }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
