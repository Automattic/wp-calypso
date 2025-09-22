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

	const { data: filteredPlugins, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, view, fields );
	}, [ data, view ] );

	const { data: marketplacePlugins, isLoading: isLoadingMarketplace } = useQuery(
		marketplaceSearchQuery( {
			perPage: Number( view.perPage ),
			slugs: filteredPlugins.map( ( plugin ) => plugin.slug ),
		} )
	);
	const plugins = ( marketplacePlugins?.data.results || [] ).flat();
	const iconsBySlug = useMemo( () => {
		return plugins.reduce( ( acc, result ) => {
			acc.set( result.fields.slug, result.fields.plugin.icons );
			return acc;
		}, new Map< string, PluginListRow[ 'icons' ] >() );
	}, [ plugins ] );

	const filteredPluginsWithIcons = useMemo( () => {
		return filteredPlugins.map( ( plugin ) => {
			return {
				...plugin,
				icons: iconsBySlug?.get( plugin.slug ) || null,
			};
		} );
	}, [ filteredPlugins, iconsBySlug ] );

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Manage plugins' ) } /> }>
			<DataViewsCard>
				<DataViews
					isLoading={ isLoadingPlugins || isLoadingMarketplace }
					data={ filteredPluginsWithIcons ?? [] }
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
