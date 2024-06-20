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
		const activeStatuses = item.statuses.filter( ( status ) => status === 'active' );
		const pendingStatuses = item.statuses.filter( ( status ) => status === 'pending' );
		const canceledStatuses = item.statuses.filter( ( status ) => status === 'canceled' );

		switch ( item.statuses.length ) {
			case 0:
				return {
					status: null,
					type: null,
				};
			case activeStatuses.length:
				return {
					status: translate( 'Active' ),
					type: 'success',
				};
			case pendingStatuses.length:
				return {
					status: translate( 'Pending' ),
					type: 'warning',
				};
			case canceledStatuses.length:
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
