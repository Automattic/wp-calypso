import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../components/dataviews-card';
import type { Field, ViewTable, View } from '@wordpress/dataviews';

interface FormData {
	type: string;
	name: string;
	currentValue: string;
	expectedValue: string;
	status: string;
}

const DEFAULT_VIEW: ViewTable = {
	type: 'table',
	page: 1,
	sort: {
		field: 'type',
		direction: 'asc',
	},
	fields: [ 'type', 'name', 'currentValue', 'expectedValue', 'status' ],
	layout: {
		styles: {
			type: {
				width: '10%',
			},
			name: {
				width: '10%',
			},
			currentValue: {
				width: '30%',
			},
			expectedValue: {
				width: '30%',
			},
			status: {
				width: '10%',
			},
		},
	},
};

export default function DnsRecordsTable() {
	const formData = [
		{
			type: 'A',
			name: '@',
			currentValue: '192.168.1.2',
			expectedValue: '192.168.1.1',
			status: 'verifying',
		},
		{
			type: 'CNAME',
			name: 'www',
			currentValue: 'foo.com',
			expectedValue: 'bar.com',
			status: 'verifying',
		},
	];

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'type',
				label: __( 'Type' ),
				type: 'text' as const,
				readOnly: true,
			},
			{
				id: 'name',
				label: __( 'Name' ),
				type: 'text' as const,
				readOnly: true,
			},
			{
				id: 'currentValue',
				label: __( 'Current Value' ),
				type: 'text' as const,
				readOnly: true,
			},
			{
				id: 'expectedValue',
				label: __( 'Expected Value' ),
				type: 'text' as const,
				readOnly: true,
			},
			{
				id: 'status',
				label: __( 'Status' ),
				type: 'text' as const,
				readOnly: true,
			},
		],
		[]
	);

	const [ view, setView ] = useState< ViewTable >( DEFAULT_VIEW );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( formData, view, fields );

	return (
		<DataViewsCard>
			<DataViews< FormData >
				data={ filteredData }
				fields={ fields }
				view={ view }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				onChangeView={ ( view: View ) => setView( view as ViewTable ) }
				getItemId={ ( item: FormData ) => `${ item.type }-${ item.name }` }
			>
				<>
					<DataViews.Layout />
					<DataViews.Pagination />
				</>
			</DataViews>
		</DataViewsCard>
	);
}
