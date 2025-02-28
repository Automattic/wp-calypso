import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { useWooPaymentsContext } from '../context';
import { getSiteData } from '../lib/site-data';
import SitesWithWooPaymentsMobileView from './mobile-view';
import {
	SiteColumn,
	TransactionsColumn,
	CommissionsPaidColumn,
	WooPaymentsStatusColumn,
} from './site-columns';
import type { SitesWithWooPaymentsState } from '../types';

export default function SitesWithWooPayments() {
	const translate = useTranslate();
	const {
		sitesWithPluginsStates: items,
		woopaymentsData,
		isLoadingWooPaymentsData,
	} = useWooPaymentsContext();
	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site', 'transactions', 'commissionsPaid', 'woopaymentsStatus' ],
	} );

	const fields = useMemo(
		() => [
			{
				id: 'site',
				label: translate( 'Site' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: SitesWithWooPaymentsState } ) => (
					<SiteColumn site={ item.siteUrl } />
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'transactions',
				label: translate( 'Transactions' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ) => {
					if ( isLoadingWooPaymentsData ) {
						return <TextPlaceholder />;
					}
					const { transactions } = getSiteData( woopaymentsData, item.blogId );
					return <TransactionsColumn transactions={ transactions } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'commissionsPaid',
				label: translate( 'Commissions Paid' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ) => {
					if ( isLoadingWooPaymentsData ) {
						return <TextPlaceholder />;
					}
					const { payout } = getSiteData( woopaymentsData, item.blogId );
					return <CommissionsPaidColumn payout={ payout } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'woopaymentsStatus',
				label: translate( 'WooPayments Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ) => (
					<WooPaymentsStatusColumn state={ item.state } siteUrl={ item.siteUrl } />
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isLoadingWooPaymentsData, translate, woopaymentsData ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( items, dataViewsState, fields );
	}, [ items, dataViewsState, fields ] );

	if ( ! isDesktop ) {
		return <SitesWithWooPaymentsMobileView items={ data } />;
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
