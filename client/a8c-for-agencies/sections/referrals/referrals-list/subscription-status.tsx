import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { getReferralStatus } from '../lib/get-referral-status';
import type { Referral } from '../types';
import type { BadgeType } from '@automattic/components';

export default function SubscriptionStatus( { item }: { item: Referral } ): ReactNode {
	const translate = useTranslate();

	const getStatus = (
		item: Referral
	): {
		status: string | null;
		type: BadgeType | null;
		tooltip?: JSX.Element;
	} => {
		if ( ! item.referralStatuses.length ) {
			return {
				status: null,
				type: null,
			};
		}

		const { pendingCount, activeCount, canceledCount, archivedCount, overallStatus } =
			item.referralStatuses.reduce(
				( acc, status ) => {
					if ( status === 'pending' ) {
						acc.pendingCount++;
					}
					if ( status === 'active' ) {
						acc.activeCount++;
					}
					if ( status === 'canceled' ) {
						acc.canceledCount++;
					}
					if ( status === 'archived' ) {
						acc.archivedCount++;
					}

					if ( ! acc.overallStatus ) {
						acc.overallStatus = status;
					} else if ( acc.overallStatus !== status ) {
						acc.overallStatus = 'mixed';
					}

					return acc;
				},
				{ pendingCount: 0, activeCount: 0, canceledCount: 0, overallStatus: '', archivedCount: 0 }
			);

		const status = overallStatus || 'mixed';

		const { status: statusText, type } = getReferralStatus( status, translate );

		return {
			status: statusText,
			type,
			tooltip:
				status === 'mixed' ? (
					<div>
						<ul>
							{ activeCount > 0 && (
								<li>
									{ translate( 'Active: %(activeCount)d', {
										args: { activeCount },
									} ) }
								</li>
							) }
							{ pendingCount > 0 && (
								<li>
									{ translate( 'Pending: %(pendingCount)d', {
										args: { pendingCount },
									} ) }
								</li>
							) }
							{ canceledCount > 0 && (
								<li>
									{ translate( 'Canceled: %(canceledCount)d', {
										args: { canceledCount },
									} ) }
								</li>
							) }
							{ archivedCount > 0 && (
								<li>
									{ translate( 'Archived: %(archivedCount)d', {
										args: { archivedCount },
									} ) }
								</li>
							) }
						</ul>
					</div>
				) : undefined,
		};
	};

	const { status, type, tooltip } = getStatus( item );

	return status && type ? (
		<StatusBadge statusProps={ { children: status, type, tooltip } } />
	) : null;
}
