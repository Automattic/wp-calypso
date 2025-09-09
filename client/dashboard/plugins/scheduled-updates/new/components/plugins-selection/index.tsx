import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../../../components/dataviews-card';
import { useEligiblePlugins } from '../../../hooks/use-eligible-plugins';
import type { SitePlugin } from '@automattic/api-core';

const pluginFields: Field< SitePlugin >[] = [
	{
		id: 'name',
		label: __( 'Plugin' ),
		enableGlobalSearch: true,
		render: ( { item } ) => item.name,
		getValue: ( { item } ) => item.name,
	},
];

type Props = {
	selectedSiteIds: string[];
	selection: string[];
	onChangeSelection: ( slugs: string[] ) => void;
};

function ScheduledUpdatesPluginsSelection( {
	selectedSiteIds,
	selection,
	onChangeSelection,
}: Props ) {
	const eligiblePlugins = useEligiblePlugins( selectedSiteIds );
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 5,
		sort: { field: 'name', direction: 'asc' },
		fields: [],
		titleField: 'name',
	} );
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( eligiblePlugins, view, pluginFields );
	}, [ eligiblePlugins, view ] );
	const actions: Array< Action< SitePlugin > > = useMemo(
		() => [
			{
				id: 'bulk-select-plugins',
				label: __( 'Select' ),
				supportsBulk: true,
				callback: ( items: SitePlugin[] ) => onChangeSelection( items.map( ( item ) => item.id ) ),
			},
		],
		[ onChangeSelection ]
	);

	return (
		<DataViewsCard>
			<DataViews< SitePlugin >
				data={ filtered }
				fields={ pluginFields }
				view={ view }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ ( ids ) => onChangeSelection( ids as string[] ) }
				getItemId={ ( item: SitePlugin ) => item.id }
				actions={ actions }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				empty={ __( 'Please select a site to view available plugins.' ) }
			/>
		</DataViewsCard>
	);
}

export default ScheduledUpdatesPluginsSelection;
