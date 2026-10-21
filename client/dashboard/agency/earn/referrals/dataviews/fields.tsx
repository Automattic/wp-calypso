import { __ } from '@wordpress/i18n';
import CommissionsCell from '../commissions-cell';
import { getEstimatedCommission } from '../lib/get-estimated-commission';
import { areNextAndCurrentPayoutDatesEqual } from '../lib/get-next-payout-date';
import SubscriptionStatus from '../subscription-status';
import type { Referral } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

export function getReferralFields(
	renderClient: ( item: Referral ) => ReactNode = ( item ) => item.client.email
): Field< Referral >[] {
	return [
		{
			id: 'client',
			label: __( 'Client' ),
			enableHiding: false,
			enableSorting: true,
			enableGlobalSearch: true,
			getValue: ( { item } ) => item.client.email,
			render: ( { item } ) => renderClient( item ),
		},
		{
			id: 'completed-orders',
			label: __( 'Purchases' ),
			enableHiding: true,
			enableSorting: true,
			getValue: ( { item } ) =>
				item.referralStatuses.filter( ( status ) => status === 'active' ).length,
		},
		{
			id: 'pending-orders',
			label: __( 'Pending orders' ),
			enableHiding: true,
			enableSorting: true,
			getValue: ( { item } ) =>
				item.referralStatuses.filter( ( status ) => status === 'pending' ).length,
		},
		{
			id: 'estimated-commissions',
			label: __( 'Estimated commissions' ),
			enableHiding: true,
			enableSorting: true,
			getValue: ( { item } ) => {
				const currentQuarter = getEstimatedCommission( [ item ] );
				return areNextAndCurrentPayoutDatesEqual( new Date() )
					? currentQuarter
					: getEstimatedCommission( [ item ], true ) + currentQuarter;
			},
			render: ( { item } ) => <CommissionsCell referral={ item } />,
		},
		{
			id: 'subscription-status',
			label: __( 'Subscription status' ),
			enableHiding: true,
			enableSorting: false,
			getValue: () => '',
			render: ( { item } ) => <SubscriptionStatus item={ item } />,
		},
	];
}
