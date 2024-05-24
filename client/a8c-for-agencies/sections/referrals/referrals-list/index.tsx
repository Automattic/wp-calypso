import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SubscriptionStatus from './subscription-status';
import type { Referral } from '../types';

interface Props {
	referrals: Referral[];
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
}

export default function ReferralList( { referrals, dataViewsState, setDataViewsState }: Props ) {
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
		<ItemsDataViews
			data={ {
				items: referrals,
				pagination: {
					totalItems: 1,
					totalPages: 1,
				},
				itemFieldId: 'ref',
				searchLabel: translate( 'Search referrals' ),
				fields: fields,
				actions: [],
				setDataViewsState: setDataViewsState,
				dataViewsState: dataViewsState,
			} }
		/>
	);
}
