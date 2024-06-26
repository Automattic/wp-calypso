import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useCallback } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ReferralDetailsTable from '../common/referral-details-table';
import AssignedTo from './components/assigned-to';
import DateAssigned from './components/date';
import ProductDetails from './components/product-details';
import TotalAmount from './components/total-amount';
import type { ReferralPurchase } from '../types';
import './style.scss';

export default function ReferralPurchases( { purchases }: { purchases: ReferralPurchase[] } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data, isFetching } = useProductsQuery();

	const handleAssignToSite = useCallback(
		( url: string ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_referrals_assign_purchase_to_site_button_click' ) );
			page.redirect( url );
		},
		[ dispatch ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'product-details',
				header: translate( 'Product Details' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return <ProductDetails isFetching={ isFetching } purchase={ item } data={ data } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'assigned-to',
				header: translate( 'Assigned to' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return (
						<AssignedTo
							purchase={ item }
							data={ data }
							handleAssignToSite={ handleAssignToSite }
							isFetching={ isFetching }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'date',
				header: translate( 'Assigned on' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return <DateAssigned purchase={ item } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'total',
				header: translate( 'Total' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return <TotalAmount isFetching={ isFetching } purchase={ item } data={ data } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate, data, isFetching, handleAssignToSite ]
	);

	return (
		<ReferralDetailsTable
			heading={ translate( 'Purchases' ) }
			items={ purchases }
			fields={ fields }
		/>
	);
}
