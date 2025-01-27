import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import type { Referral } from '../types';

export default function SubscriptionStatus( { item }: { item: Referral } ): ReactNode {
	const translate = useTranslate();

	const getStatus = (
		item: Referral
	): {
		status: string | null;
		type: 'warning' | 'success' | 'info' | 'error' | null;
		tooltip?: string | JSX.Element;
	} => {
		if ( ! item.purchaseStatuses.length ) {
			return {
				status: null,
				type: null,
			};
		}

		const { pendingCount, activeCount, canceledCount, overallStatus } =
			item.purchaseStatuses.reduce(
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

					if ( ! acc.overallStatus ) {
						acc.overallStatus = status;
					} else if ( acc.overallStatus !== status ) {
						acc.overallStatus = 'mixed';
					}

					return acc;
				},
				{ pendingCount: 0, activeCount: 0, canceledCount: 0, overallStatus: '' }
			);

		let status = overallStatus || 'mixed';

		// If the referral is archived, override the status.
		if ( item.referralStatuses.includes( 'archived' ) ) {
			status = 'archived';
		}

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
			case 'archived':
				return {
					status: translate( 'Archived' ),
					type: 'info',
				};
			default:
				return {
					status: translate( 'Mixed' ),
					type: 'warning',
					tooltip: (
						<div>
							<ul>
								<li>
									{ translate( 'Active: %(activeCount)d', {
										args: { activeCount },
									} ) }
								</li>
								<li>
									{ translate( 'Pending: %(pendingCount)d', {
										args: { pendingCount },
									} ) }
								</li>
								<li>
									{ translate( 'Canceled: %(canceledCount)d', {
										args: { canceledCount },
									} ) }
								</li>
							</ul>
						</div>
					),
				};
		}
	};

	const { status, type, tooltip } = getStatus( item );

	return status && type ? (
		<StatusBadge statusProps={ { children: status, type, tooltip } } />
	) : null;
}
