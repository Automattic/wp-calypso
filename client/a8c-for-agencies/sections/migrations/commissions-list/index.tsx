import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { getSiteReviewStatus } from '../lib/utils';
import { MigratedOnColumn, ReviewStatusColumn, SiteColumn } from './commission-columns';
import CommissionListActions from './commission-list-actions';
import MigrationsCommissionsListMobileView from './mobile-view';
import type { TaggedSite } from '../types';
import type { Field } from '@wordpress/dataviews';

export default function MigrationsCommissionsList( {
	items,
	fetchMigratedSites,
}: {
	items: TaggedSite[];
	fetchMigratedSites: () => void;
} ) {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site', 'migratedOn', 'reviewStatus', 'remove' ],
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
				render: ( { item }: { item: TaggedSite } ): ReactNode => <SiteColumn site={ item.url } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'migratedOn',
				// FIXME: This should be "Migrated on" instead of "Date Added"
				// We will change this when the MC tool is implemented and we have the migration date
				label: translate( 'Date Added' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => <MigratedOnColumn migratedOn={ item.created_at } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'reviewStatus',
				label: translate( 'Review status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TaggedSite } ): ReactNode => {
					const tags = item.tags.map( ( tag ) => tag.name );
					const status = getSiteReviewStatus( tags );
					return <ReviewStatusColumn reviewStatus={ status } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'remove',
				label: translate( 'Actions' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TaggedSite } ) => (
					<CommissionListActions fetchMigratedSites={ fetchMigratedSites } site={ item } />
				),
				enableSorting: false,
			},
		],
		[ translate, fetchMigratedSites ]
	);

	if ( ! isDesktop ) {
		return <MigrationsCommissionsListMobileView commissions={ items } />;
	}

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
