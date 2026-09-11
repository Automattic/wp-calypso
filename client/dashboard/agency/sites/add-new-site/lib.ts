import type { Agency, AgencyPendingSite } from '@automattic/api-core';

export type PressableOwnershipType = 'none' | 'regular' | 'agency';

/**
 * Where an agency's Pressable plan came from, which decides whether the menu
 * links straight into Pressable or into the A4A marketplace.
 */
export function getPressableOwnershipType(
	agency: Agency | null | undefined
): PressableOwnershipType {
	const pressable = agency?.third_party?.pressable;

	if ( ! pressable?.pressable_id ) {
		return 'none';
	}

	// A regular Pressable plan (not bought through the A4A marketplace) has a null A4A id.
	return pressable.a4a_id === null ? 'regular' : 'agency';
}

/**
 * Whether the agency has been approved. Agencies created before approval
 * existed have no status at all, and count as approved.
 */
export function isAgencyApproved( agency: Agency | null | undefined ): boolean {
	if ( ! agency ) {
		return false;
	}
	return ! agency.approval_status || agency.approval_status === 'approved';
}

/**
 * The pending sites the agency can actually set up right now. A site the
 * backend has not attached a license key to yet is not offerable.
 */
export function getAvailablePendingSites(
	pendingSites: AgencyPendingSite[] | undefined
): AgencyPendingSite[] {
	return (
		pendingSites?.filter( ( { features } ) => {
			const atomic = features?.wpcom_atomic;
			return atomic?.state === 'pending' && !! atomic?.license_key;
		} ) ?? []
	);
}
