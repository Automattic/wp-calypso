/**
 * Determines the review status of a migrated site based on its incentive_status.
 *
 * @param incentiveStatus - The incentive_status value from the site object.
 * @returns The review status: 'paid', 'confirmed', 'rejected', or 'pending'.
 */
export const getSiteReviewStatus = (
	incentiveStatus: string
): 'pending' | 'confirmed' | 'rejected' | 'paid' => {
	if ( incentiveStatus === 'paid' ) {
		return 'paid';
	}
	if ( incentiveStatus === 'verified' ) {
		return 'confirmed';
	}
	if ( incentiveStatus === 'pending' ) {
		return 'pending';
	}
	// Fallback to pending if status is empty or unknown
	return 'pending';
};
