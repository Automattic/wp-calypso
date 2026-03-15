import page from '@automattic/calypso-router';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useCallback } from 'react';
import { EXTERNAL_PRESSABLE_AUTH_URL } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
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

	const { data, isFetching } = useProductsQuery( false, true );

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
				label: translate( 'Product Details' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return <ProductDetails isFetching={ isFetching } purchase={ item } data={ data } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'site-details',
				label: translate( 'Site details' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					if ( item.license?.license_key?.startsWith( 'pressable-' ) ) {
						return (
							<ExternalLink href={ EXTERNAL_PRESSABLE_AUTH_URL }>
								{ translate( 'Manage in Pressable' ) }
							</ExternalLink>
						);
					}

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
				label: translate( 'Assigned on' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					return <DateAssigned purchase={ item } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'total',
				label: translate( 'Total' ).toUpperCase(),
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

	return <ReferralDetailsTable items={ purchases } fields={ fields } />;
}
