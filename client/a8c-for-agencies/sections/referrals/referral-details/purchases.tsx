import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import ReferralDetailsTable from '../common/referral-details-table';
import StatusBadge from '../common/step-section-item/status-badge';
import type { ReferralPurchase } from '../types';

import './style.scss';

export default function ReferralPurchases( { purchases }: { purchases: ReferralPurchase[] } ) {
	const translate = useTranslate();

	const { data, isFetching } = useProductsQuery();

	const fields = useMemo(
		() => [
			{
				id: 'product-details',
				header: translate( 'Product Details' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					const product = data?.find( ( product ) => product.product_id === item.product_id );
					return isFetching ? <TextPlaceholder /> : product?.name;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'date',
				header: translate( 'Date' ).toUpperCase(),
				getValue: () => '-',
				render: (): ReactNode => {
					return ''; // FIXME: Add date when the data is available
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'assigned-to',
				header: translate( 'Assigned to' ).toUpperCase(),
				getValue: () => '-',
				render: (): ReactNode => {
					const isAssigned = false; // FIXME: Show the assigned site when the data is available
					return isAssigned ? (
						'Site Name'
					) : (
						<>
							<StatusBadge
								statusProps={ { children: translate( 'Unassigned' ), type: 'warning' } }
							/>
							{
								// TODO: Implement assign to site functionality
								<Button className="referrals-purchases__assign-button" borderless>
									{ translate( 'Assign to site' ) }
								</Button>
							}
						</>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'total',
				header: translate( 'Total' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: ReferralPurchase } ): ReactNode => {
					const product = data?.find( ( product ) => product.product_id === item.product_id );
					return isFetching ? <TextPlaceholder /> : `$${ product?.amount }`;
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate, isFetching, data ]
	);

	return (
		<ReferralDetailsTable
			heading={ translate( 'Purchases' ) }
			items={ purchases }
			fields={ fields }
		/>
	);
}
