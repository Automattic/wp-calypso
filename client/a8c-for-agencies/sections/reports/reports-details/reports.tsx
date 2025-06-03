import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { ReportDateColumn, ReportStatusColumn } from '../primary/dashboard/report-columns';
import type { Report } from '../types';
import type { Action } from 'calypso/a8c-for-agencies/components/list-item-cards';

export default function Reports( { reports, actions }: { reports: Report[]; actions: Action[] } ) {
	const translate = useTranslate();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'status', 'createdAt' ],
	} );

	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: () => '-',
				render: ( { item }: { item: Report } ) => <ReportStatusColumn status={ item.status } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'createdAt',
				label: translate( 'Created' ),
				getValue: () => '-',
				render: ( { item }: { item: Report } ) => <ReportDateColumn date={ item.createdAt } />,
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( reports, dataViewsState, fields );
	}, [ reports, dataViewsState, fields ] );

	return (
		<div className="redesigned-a8c-table bordered">
			<ItemsDataViews
				data={ {
					items: data,
					getItemId: ( item: Report ) => item.id,
					pagination: paginationInfo,
					enableSearch: false,
					fields,
					actions,
					setDataViewsState,
					dataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
