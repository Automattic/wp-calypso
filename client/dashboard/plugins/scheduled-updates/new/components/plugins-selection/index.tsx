import { Card, CardBody, CardHeader } from '@wordpress/components';
import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../../../components/dataviews-card';
import { DataViewsEmptyState } from '../../../../../components/dataviews-empty-state';
import { useEligiblePlugins } from '../../../hooks/use-eligible-plugins';

export type PluginRow = { id: string; name: string };

type Props = {
	selectedSiteIds: string[];
	selection: string[];
	onChangeSelection: ( slugs: string[] ) => void;
	actions: Array< Action< PluginRow > >;
};

export function PluginsScheduleNewPlugins( {
	selectedSiteIds,
	selection,
	onChangeSelection,
	actions,
}: Props ) {
	const eligiblePlugins = useEligiblePlugins( selectedSiteIds );
	const pluginRows: PluginRow[] = useMemo(
		() => eligiblePlugins.map( ( plugin ) => ( { id: plugin.id, name: plugin.name } ) ),
		[ eligiblePlugins ]
	);

	const pluginFields: Field< PluginRow >[] = useMemo(
		() => [
			{
				id: 'name',
				label: __( 'Plugin' ),
				enableGlobalSearch: true,
				render: ( { item } ) => item.name,
				getValue: ( { item } ) => item.name,
			},
		],
		[]
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
	}, [ pluginRows, view, pluginFields ] );

	return (
		<Card>
			<CardHeader>
				<strong>{ __( 'Select plugins' ) }</strong>
			</CardHeader>
			<CardBody>
				<DataViewsCard>
					<div className="plugins-schedule-new">
						{ pluginRows.length > 0 ? (
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
							/>
						) : (
							<DataViewsEmptyState
								title=""
								description={ __( 'Please select a site to view available plugins.' ) }
							/>
						) }
					</div>
				</DataViewsCard>
			</CardBody>
		</Card>
	);
}
