import { marketplacePluginQuery, pluginsQuery, wpOrgPluginQuery } from '@automattic/api-queries';
import { useQuery, useQueries } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
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
	const { data: sitesPlugins, isLoading } = useQuery( pluginsQuery() );
	const actions = getActions();
	const [ view, setView ] = useState( defaultView );
	const data = useMemo( () => mapApiPluginsToDataViewPlugins( sitesPlugins ), [ sitesPlugins ] );

	const pluginSlugs = useMemo( () => data?.map( ( plugin ) => plugin.slug ), [ data ] );
	const locale = useLocale();
	const pluginQueries = useQueries( {
		queries: pluginSlugs.flatMap( ( slug ) => [
			marketplacePluginQuery( slug ),
			wpOrgPluginQuery( slug, locale ),
		] ),
	} );

	const iconsBySlug = useMemo( () => {
		return pluginQueries.reduce( ( acc, query ) => {
			if ( query.data ) {
				acc.set( query.data.slug, query.data.icons || null );
			}
			return acc;
		}, new Map< string, PluginListRow[ 'icons' ] >() );
	}, [ pluginQueries ] );

	const dataWithIcons = useMemo( () => {
		return data.map( ( plugin ) => {
			return {
				...plugin,
				icons: iconsBySlug.get( plugin.slug ) || null,
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
