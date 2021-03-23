/**
 * Internal dependencies
 */
import { THREAT_FIXED_REVIEW_PROMPT } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Hide the review prompt.
 *
 * @returns {object} Action object
 */
export const hideThreatFixedReviewPrompt = () => ( {
	type: THREAT_FIXED_REVIEW_PROMPT,
	isVisible: false,
	fixDate: null,
} );

/**
 * Show the review prompt.
 *
 * @returns {object} Action object
 */
export const showThreatFixedReviewPrompt = () => ( {
	type: THREAT_FIXED_REVIEW_PROMPT,
	isVisible: true,
	fixDate: Date.now(),
} );
