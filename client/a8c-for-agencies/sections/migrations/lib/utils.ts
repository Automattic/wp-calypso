import {
	A4A_MIGRATED_SITE_REJECTED,
	A4A_MIGRATED_SITE_VERIFIED,
	A4A_MIGRATED_STATUS_PAID,
} from './constants';

/**
 * Determines the review status of a migrated site based on its tags.
 *
 * @param tags - An array of tag names associated with the site.
 * @returns The review status: 'paid', 'confirmed', 'rejected', or 'pending'.
 */
export const getSiteReviewStatus = (
	tags: string[]
): 'pending' | 'confirmed' | 'rejected' | 'paid' => {
	// Check for paid status first
	if ( tags.includes( A4A_MIGRATED_STATUS_PAID ) ) {
		return 'paid';
	}
	if ( tags.includes( A4A_MIGRATED_SITE_VERIFIED ) ) {
		return 'confirmed';
	}
	if ( tags.includes( A4A_MIGRATED_SITE_REJECTED ) ) {
		return 'rejected';
	}
	// If none of the above tags are present, assume pending.
	// The presence of A4A_MIGRATED_SITE_TAG is implicitly assumed for sites passed to this function.
	return 'pending';
};
