import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { MigratedOnColumn, ReviewStatusColumn, SiteColumn } from './commission-columns';
import type { MigrationCommissionItem } from '../types';
import type { Field } from '@wordpress/dataviews';

export default function MigrationsCommissionsList( {
	items,
}: {
	items: MigrationCommissionItem[];
} ) {
	const translate = useTranslate();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
	} );

	const pagination = {
		totalItems: items.length,
		totalPages: 1,
	};

	const fields: Field< any >[] = useMemo(
		() => [
			{
				id: 'site',
				label: translate( 'Site' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => <SiteColumn site={ item.siteUrl } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'migratedOn',
				label: translate( 'Migrated on' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => <MigratedOnColumn migratedOn={ item.migratedOn } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'reviewStatus',
				label: translate( 'Review status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => (
					<ReviewStatusColumn reviewStatus={ item.reviewStatus } />
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items,
					getItemId: ( item ) => `${ item.id }`,
					pagination,
					enableSearch: false,
					fields,
					actions: [],
					setDataViewsState,
					dataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
