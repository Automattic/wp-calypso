import { marketplaceSearchQuery, pluginsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
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
	const actions = getActions();
	const [ view, setView ] = useState( defaultView );
	const data = useMemo( () => mapApiPluginsToDataViewPlugins( sitesPlugins ), [ sitesPlugins ] );

	const pluginSlugs = useMemo( () => data?.map( ( plugin ) => plugin.slug ), [ data ] );
	const { data: marketplacePlugins, isLoading: isLoadingMarketplace } = useQuery(
		marketplaceSearchQuery( pluginSlugs )
	);
	const isLoading = isLoadingPlugins || isLoadingMarketplace;

	const iconsBySlug = useMemo( () => {
		return marketplacePlugins?.data.results.reduce( ( acc, result ) => {
			acc.set( result.fields.slug, result.fields.plugin.icons );
			return acc;
		}, new Map< string, PluginListRow[ 'icons' ] >() );
	}, [ marketplacePlugins ] );

	const dataWithIcons = useMemo( () => {
		return data.map( ( plugin ) => {
			return {
				...plugin,
				icons: iconsBySlug?.get( plugin.slug ) || null,
			};
		} );
	}, [ data, iconsBySlug ] );

	const { data: filteredPlugins, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( dataWithIcons, view, fields );
	}, [ dataWithIcons, view ] );

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Manage plugins' ) } /> }>
			<DataViewsCard>
				<DataViews
					isLoading={ isLoading }
					data={ filteredPlugins ?? [] }
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
