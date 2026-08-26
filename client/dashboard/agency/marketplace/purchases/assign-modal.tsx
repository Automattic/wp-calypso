import {
	Button,
	RadioControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViews } from '../../../components/dataviews';
import type { AgencyLicense, AgencySite } from './mock-data';
import type { Field, View } from '@wordpress/dataviews';

export default function AssignLicenseModal( {
	license,
	sites,
	onAssign,
	onCancel,
}: {
	license: AgencyLicense;
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
				render: ( { item } ) =>
					item.connected ? (
						<RadioControl
							selected={ selected?.blogId === item.blogId ? String( item.blogId ) : '' }
							options={ [ { label: item.url, value: String( item.blogId ) } ] }
							onChange={ () => setSelected( item ) }
						/>
					) : (
						<HStack justify="space-between" alignment="center">
							<Text variant="muted">{ item.url }</Text>
							<Text variant="muted" size={ 12 }>
								{ __( 'Connect your WordPress.com user to assign' ) }
							</Text>
						</HStack>
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
		<VStack spacing={ 4 }>
			<Text variant="muted">
				{ sprintf(
					/* translators: %s: product name */
					__( 'Select the site to assign %s to.' ),
					license.product
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
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					__next40pxDefaultSize
					disabled={ ! selected }
					onClick={ () => selected && onAssign( selected ) }
				>
					{ __( 'Assign to site' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
