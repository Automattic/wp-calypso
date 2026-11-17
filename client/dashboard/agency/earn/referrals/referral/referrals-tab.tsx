import { agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useMemo, useState } from 'react';
import { DataViews, DataViewsCard } from '../../../../components/dataviews';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { useReferral } from '../hooks/use-referral';
import { getOrderSummary } from '../lib/get-order-summary';
import { getReferralStatus } from '../lib/get-referral-status';
import { sortReferralOrders } from '../lib/referral-orders';
import ReferralNotFound from './not-found';
import OrderSummary from './order-summary';
import { useReferralActions } from './referral-actions';
import type { ReferralApiResponse } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 20,
	titleField: 'summary',
	fields: [ 'status' ],
};

export default function ReferralReferralsTab() {
	const { referral, agencyId } = useReferral();
	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const fields = useMemo< Field< ReferralApiResponse >[] >(
		() => [
			{
				id: 'summary',
				label: __( 'Referral' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => getOrderSummary( item, products ),
				render: ( { item } ) => <OrderSummary order={ item } products={ products } />,
			},
			{
				id: 'status',
				label: __( 'Status' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => item.status,
				render: ( { item } ) => {
					const { status, type } = getReferralStatus( item.status );
					return <Badge intent={ type }>{ status }</Badge>;
				},
			},
		],
		[ products ]
	);

	const actions = useReferralActions( agencyId );

	const orders = useMemo(
		() => ( referral ? sortReferralOrders( referral.referrals ) : [] ),
		[ referral ]
	);

	const { data: paginatedOrders, paginationInfo } = useMemo(
		() => filterSortAndPaginate( orders, view, fields ),
		[ orders, view, fields ]
	);

	if ( ! referral ) {
		return <ReferralNotFound />;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Referrals' ) } /> }>
			<DataViewsCard>
				<DataViews< ReferralApiResponse >
					data={ paginatedOrders }
					fields={ fields }
					actions={ actions }
					view={ view }
					onChangeView={ setView }
					search={ false }
					getItemId={ ( item ) => String( item.id ) }
					defaultLayouts={ { table: { titleField: 'summary' } } }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
