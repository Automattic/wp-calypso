import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import StatusBadge from '../common/step-section-item/status-badge';
import type { Referral } from '../types';

export default function SubscriptionStatus( { item }: { item: Referral } ): ReactNode {
	const translate = useTranslate();

	const getStatus = (
		item: Referral
	): {
		status: string | null;
		type: 'warning' | 'success' | 'info' | null;
	} => {
		if ( ! item.statuses.length ) {
			return {
				status: null,
				type: null,
			};
		}

		const status = item.statuses.reduce( ( prev, curr ) => {
			if ( prev === curr ) {
				return curr;
			}

			return 'mixed';
		}, item.statuses[ 0 ] );

		switch ( status ) {
			case 'active':
				return {
					status: translate( 'Active' ),
					type: 'success',
				};
			case 'pending':
				return {
					status: translate( 'Pending' ),
					type: 'warning',
				};
			case 'canceled':
				return {
					status: translate( 'Canceled' ),
					type: 'info',
				};
			default:
				return {
					status: translate( 'Mixed' ),
					type: 'warning',
				};
		}
	};

	const { status, type } = getStatus( item );

	return status && type ? <StatusBadge statusProps={ { children: status, type } } /> : null;
}
