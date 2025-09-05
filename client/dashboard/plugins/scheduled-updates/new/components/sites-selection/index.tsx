import { Card, CardBody, CardHeader } from '@wordpress/components';
import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../../../components/dataviews-card';
import { useEligibleSites } from '../../../hooks/use-eligible-sites';
import type { Site } from '@automattic/api-core';

type Props = {
	selection: string[];
	onChangeSelection: ( ids: string[] ) => void;
	actions: Array< Action< Site > >;
};

export function PluginsScheduleNewSites( { selection, onChangeSelection, actions }: Props ) {
	const { data: sites = [] } = useEligibleSites();
	const siteFields: Field< Site >[] = useMemo(
		() => [
			{
				id: 'title',
				label: __( 'Site' ),
				enableGlobalSearch: true,
				render: ( { item } ) => item.name || item.URL || String( item.ID ),
				getValue: ( { item } ) => item.name || item.URL || String( item.ID ),
			},
		],
		[]
	);

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 5,
		sort: { field: 'title', direction: 'asc' },
		fields: [],
		titleField: 'title',
	} );

	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( sites as Site[], view, siteFields );
	}, [ sites, view, siteFields ] );

	return (
		<Card>
			<CardHeader>
				<strong>{ __( 'Select sites' ) }</strong>
			</CardHeader>
			<CardBody>
				<DataViewsCard>
					<div className="plugins-schedule-new">
						<DataViews< Site >
							data={ filtered }
							fields={ siteFields }
							view={ view }
							onChangeView={ setView }
							selection={ selection }
							onChangeSelection={ ( ids ) => onChangeSelection( ids as string[] ) }
							getItemId={ ( item: Site ) => String( item.ID ) }
							actions={ actions }
							defaultLayouts={ { table: {} } }
							paginationInfo={ paginationInfo }
						/>
					</div>
				</DataViewsCard>
			</CardBody>
		</Card>
	);
}
