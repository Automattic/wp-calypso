import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../../../components/dataviews-card';
import { DataViewsEmptyState } from '../../../../../components/dataviews-empty-state';
import { useEligiblePlugins } from '../../../hooks/use-eligible-plugins';

const pluginFields: Field< PluginRow >[] = [
	{
		id: 'name',
		label: __( 'Plugin' ),
		enableGlobalSearch: true,
		render: ( { item } ) => item.name,
		getValue: ( { item } ) => item.name,
	},
];

type PluginRow = { id: string; name: string };

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
	const pluginRows: PluginRow[] = useMemo(
		() => eligiblePlugins.map( ( plugin ) => ( { id: plugin.id, name: plugin.name } ) ),
		[ eligiblePlugins ]
	);

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 5,
		sort: { field: 'name', direction: 'asc' },
		fields: [],
		titleField: 'name',
	} );

	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( pluginRows, view, pluginFields );
	}, [ pluginRows, view ] );

	const actions: Array< Action< PluginRow > > = useMemo(
		() => [
			{
				id: 'bulk-select-plugins',
				label: __( 'Select' ),
				supportsBulk: true,
				callback: ( items: PluginRow[] ) => onChangeSelection( items.map( ( item ) => item.id ) ),
			},
		],
		[ onChangeSelection ]
	);

	return (
		<DataViewsCard>
			<DataViews< PluginRow >
				data={ filtered }
				fields={ pluginFields }
				view={ view }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ ( ids ) => onChangeSelection( ids as string[] ) }
				getItemId={ ( item: PluginRow ) => item.id }
				actions={ actions }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				empty={
					<DataViewsEmptyState
						title=""
						description={ __( 'Please select a site to view available plugins.' ) }
					/>
				}
			/>
		</DataViewsCard>
	);
}

export default ScheduledUpdatesPluginsSelection;
