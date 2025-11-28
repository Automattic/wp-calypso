import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../components/dataviews';
import { useEligiblePlugins } from '../hooks/use-eligible-plugins';
import type { CorePlugin } from '@automattic/api-core';

const pluginFields: Field< CorePlugin >[] = [
	{
		id: 'name',
		label: __( 'Plugin' ),
		enableGlobalSearch: true,
		render: ( { item } ) => item.name,
		getValue: ( { item } ) => item.name,
	},
];

const defaultView: View = {
	type: 'table',
	page: 1,
	perPage: 5,
	sort: { field: 'name', direction: 'asc' },
	fields: [],
	titleField: 'name',
};

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
	const [ view, setView ] = useState< View >( defaultView );
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( eligiblePlugins, view, pluginFields );
	}, [ eligiblePlugins, view ] );
	const actions: Array< Action< CorePlugin > > = useMemo(
		() => [
			{
				id: 'bulk-select-plugins',
				label: __( 'Select' ),
				supportsBulk: true,
				callback: ( items: CorePlugin[] ) =>
					onChangeSelection( items.map( ( item ) => item.plugin ) ),
			},
		],
		[ onChangeSelection ]
	);

	return (
		<DataViewsCard>
			<DataViews< CorePlugin >
				data={ filtered }
				fields={ pluginFields }
				view={ view }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ ( ids ) => onChangeSelection( ids as string[] ) }
				getItemId={ ( item: CorePlugin ) => item.plugin }
				actions={ actions }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				empty={ <p>{ __( 'Please select a site to view available plugins.' ) }</p> }
			/>
		</DataViewsCard>
	);
}

export default ScheduledUpdatesPluginsSelection;
