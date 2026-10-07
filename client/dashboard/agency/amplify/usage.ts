import type { AgencyApprovalStatus, AmplifyUsage } from '@automattic/api-core';

/**
 * - pending: signed up, awaiting review. Scanning unlocks on approval.
 * - rejected: application not approved.
 * - available / low / cap: approved, with the tier's monthly allowance
 *   (Account activated starts at 5 scans).
 */
export type AmplifyUsageStatus = 'unknown' | 'pending' | 'rejected' | 'available' | 'low' | 'cap';

export function getUsageStatus(
	usage?: AmplifyUsage,
	{
		approvalStatus,
		notActivated = false,
	}: { approvalStatus?: AgencyApprovalStatus | ''; notActivated?: boolean } = {}
): AmplifyUsageStatus {
	if ( approvalStatus === 'rejected' ) {
		return 'rejected';
	}
	// `amplify_account_not_activated` from the API means the same as pending review.
	if ( approvalStatus === 'pending' || notActivated ) {
		return 'pending';
	}
	if ( ! usage ) {
		return 'unknown';
	}
	if ( usage.limit <= 0 ) {
		return 'pending';
	}
	if ( usage.used >= usage.limit ) {
		return 'cap';
	}
	// Last scan, or 20% left on bigger allowances.
	if ( usage.limit - usage.used <= Math.max( 1, Math.floor( usage.limit * 0.2 ) ) ) {
		return 'low';
	}
	return 'available';
}

export function canStartScan( status: AmplifyUsageStatus ) {
	return status !== 'cap' && status !== 'pending' && status !== 'rejected';
}

/** Statuses where the agency has an allowance to show. */
export function hasAllowance( status: AmplifyUsageStatus ) {
	return status === 'available' || status === 'low' || status === 'cap';
}
