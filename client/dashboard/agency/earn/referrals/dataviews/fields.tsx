import { __ } from '@wordpress/i18n';
import CommissionsCell from '../commissions-cell';
import SubscriptionStatus from '../subscription-status';
import type { Referral } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

/**
 * The client cell is rendered by the host app so navigation stays app-specific
 * (MSD routes to a detail page; A4A opens a preview pane). Defaults to plain text.
 */
export function getReferralFields(
	renderClient: ( item: Referral ) => ReactNode = ( item ) => item.client.email
): Field< Referral >[] {
	return [
		{
			id: 'client',
			label: __( 'Client' ),
			enableHiding: false,
			enableSorting: false,
			enableGlobalSearch: true,
			getValue: ( { item } ) => item.client.email,
			render: ( { item } ) => renderClient( item ),
		},
		{
			id: 'completed-orders',
			label: __( 'Purchases' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) =>
				item.referralStatuses.filter( ( status ) => status === 'active' ).length,
		},
		{
			id: 'pending-orders',
			label: __( 'Pending orders' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) =>
				item.referralStatuses.filter( ( status ) => status === 'pending' ).length,
		},
		{
			id: 'estimated-commissions',
			label: __( 'Estimated commissions' ),
			enableHiding: false,
			enableSorting: false,
			getValue: () => '',
			render: ( { item } ) => <CommissionsCell referral={ item } />,
		},
		{
			id: 'subscription-status',
			label: __( 'Subscription status' ),
			enableHiding: false,
			enableSorting: false,
			getValue: () => '',
			render: ( { item } ) => <SubscriptionStatus item={ item } />,
		},
	];
}
