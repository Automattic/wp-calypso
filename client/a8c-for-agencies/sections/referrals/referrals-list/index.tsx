import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode } from 'react';
import { DATAVIEWS_TABLE } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViews } from 'calypso/components/dataviews';
import SubscriptionStatus from './subscription-status';
import type { Referral } from '../types';

interface Props {
	referrals: Referral[];
}

export default function ReferralList( { referrals }: Props ) {
	const translate = useTranslate();

	const fields = useMemo(
		() => [
			{
				id: 'client',
				header: translate( 'Client' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Referral } ): ReactNode => {
					return item.client_email;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'purchases',
				header: translate( 'Purchases' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Referral } ): ReactNode => {
					return item.purchases.length;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'pending-orders',
				header: translate( 'Pending Orders' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Referral } ): ReactNode => {
					return item.statuses.filter( ( status ) => status === 'pending' ).length;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'commissions',
				header: translate( 'Commissions' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Referral } ): ReactNode => {
					return `$${ item.commissions }`;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'subscription-status',
				header: translate( 'Subscription Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Referral } ): ReactNode => <SubscriptionStatus item={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				header: translate( 'Actions' ).toUpperCase(),
				render: () => {
					return (
						// TODO: Show details preview panel
						<div>
							<Button borderless>
								<Gridicon icon="chevron-right" />
							</Button>
						</div>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);
	return (
		<DataViews
			data={ referrals }
			paginationInfo={ { totalItems: 1, totalPages: 1 } }
			fields={ fields }
			view={ {
				filters: [],
				sort: {
					field: '',
					direction: 'asc',
				},
				type: DATAVIEWS_TABLE,
				perPage: 1,
				page: 1,
				hiddenFields: [],
				layout: {},
			} }
			search={ false } // TODO: Implement search
			supportedLayouts={ [ 'table' ] }
			actions={ [] }
		/>
	);
}
