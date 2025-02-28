import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SitesWithWooPaymentsMobileView from './mobile-view';
import {
	CommissionsPaidColumn,
	SiteColumn,
	TransactionsColumn,
	WooPaymentsStatusColumn,
} from './site-columns';
import type { SitesWithWooPaymentsState } from '../types';
import type { Field } from '@wordpress/dataviews';

export default function SitesWithWooPayments( { items }: { items: SitesWithWooPaymentsState[] } ) {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site', 'transactions', 'commissionsPaid', 'woopaymentsStatus' ],
	} );

	const fields: Field< any >[] = useMemo(
		() => [
			{
				id: 'site',
				label: translate( 'Site' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: SitesWithWooPaymentsState } ): ReactNode => (
					<SiteColumn site={ item.siteUrl } />
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'transactions',
				label: translate( 'Transactions' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => (
					<TransactionsColumn transactions={ item.transactions } />
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'commissionsPaid',
				label: translate( 'Commissions Paid' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => <CommissionsPaidColumn payout={ item.payout } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'woopaymentsStatus',
				label: translate( 'WooPayments Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ): ReactNode => (
					<WooPaymentsStatusColumn state={ item.state } siteUrl={ item.siteUrl } />
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( items, dataViewsState, fields );
	}, [ items, dataViewsState, fields ] );

	if ( ! isDesktop ) {
		return <SitesWithWooPaymentsMobileView items={ items } />;
	}

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items: data,
					getItemId: ( item: SitesWithWooPaymentsState ) => `${ item.blogId }`,
					pagination: paginationInfo,
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
