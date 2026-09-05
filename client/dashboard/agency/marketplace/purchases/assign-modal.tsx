import {
	Button,
	RadioControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViews } from '../../../components/dataviews';
import type { AgencySite } from './mock-data';
import type { Field, View } from '@wordpress/dataviews';

export default function AssignLicenseModal( {
	sites,
	onAssign,
	onCancel,
}: {
	sites: AgencySite[];
	onAssign: ( site: AgencySite ) => void;
	onCancel: () => void;
} ) {
	const [ selected, setSelected ] = useState< AgencySite | null >( null );
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		search: '',
		filters: [],
		sort: { field: '', direction: 'asc' },
		fields: [ 'site' ],
		layout: { density: 'compact' },
	} );

	const fields = useMemo< Field< AgencySite >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item } ) => item.url,
				render: ( { item } ) => (
					<RadioControl
						selected={ selected?.blogId === item.blogId ? String( item.blogId ) : '' }
						options={ [ { label: item.url, value: String( item.blogId ) } ] }
						onChange={ () => setSelected( item ) }
					/>
				),
				enableGlobalSearch: true,
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ selected ]
	);

	const { data, paginationInfo } = useMemo(
		() => filterSortAndPaginate( sites, view, fields ),
		[ sites, view, fields ]
	);

	return (
		<VStack spacing={ 6 }>
			<Text>
				{ createInterpolateElement(
					__(
						"If you don't see the site in the list, connect it first via the <a>Sites Dashboard</a>."
					),
					{ a: <a href="/sites" /> }
				) }
			</Text>

			<DataViews< AgencySite >
				data={ data }
				getItemId={ ( item ) => String( item.blogId ) }
				paginationInfo={ paginationInfo }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
			/>

			<HStack justify="flex-end" spacing={ 3 }>
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! selected }
					onClick={ () => selected && onAssign( selected ) }
				>
					{ __( 'Assign to selected site' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
