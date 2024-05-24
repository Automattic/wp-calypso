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
		type: 'warning' | 'success' | null;
	} => {
		const activeStatuses = item.statuses.filter( ( status ) => status === 'active' );
		const pendingStatuses = item.statuses.filter( ( status ) => status === 'pending' );

		if ( ! item.statuses.length ) {
			return {
				status: null,
				type: null,
			};
		}

		if ( activeStatuses.length === item.statuses.length ) {
			return {
				status: translate( 'Active' ),
				type: 'success',
			};
		}
		if ( pendingStatuses.length === item.statuses.length ) {
			return {
				status: translate( 'Pending' ),
				type: 'success',
			};
		}
		return {
			status: translate( 'Mixed' ),
			type: 'warning',
		};
	};

	const { status, type } = getStatus( item );

	return status && type ? <StatusBadge statusProps={ { children: status, type } } /> : null;
}
