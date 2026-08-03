import { Badge } from '@automattic/ui';
import { Tooltip } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { getReferralStatus } from './lib/get-referral-status';
import type { Referral } from '@automattic/api-core';

export default function SubscriptionStatus( { item }: { item: Referral } ) {
	if ( ! item.referralStatuses.length ) {
		return null;
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
			{ pendingCount: 0, activeCount: 0, canceledCount: 0, archivedCount: 0, overallStatus: '' }
		);

	const status = overallStatus || 'mixed';
	const { status: statusText, type } = getReferralStatus( status );

	const badge = <Badge intent={ type }>{ statusText }</Badge>;

	if ( status !== 'mixed' ) {
		return badge;
	}

	const tooltipText = [
		activeCount > 0 &&
			sprintf( /* translators: %d is a count of referrals */ __( 'Active: %d' ), activeCount ),
		pendingCount > 0 &&
			sprintf( /* translators: %d is a count of referrals */ __( 'Pending: %d' ), pendingCount ),
		canceledCount > 0 &&
			sprintf( /* translators: %d is a count of referrals */ __( 'Canceled: %d' ), canceledCount ),
		archivedCount > 0 &&
			sprintf( /* translators: %d is a count of referrals */ __( 'Archived: %d' ), archivedCount ),
	]
		.filter( Boolean )
		.join( ', ' );

	// Badge does not forward refs, so Tooltip needs a DOM element to anchor to.
	return (
		<Tooltip text={ tooltipText }>
			<span style={ { display: 'inline-flex' } }>{ badge }</span>
		</Tooltip>
	);
}
