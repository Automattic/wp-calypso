/**
 * The function calculates does the user fall into
 * the provided percentage of people for product sampling?
 *
 * @param userId Number
 * @param percentage Number
 * @returns {boolean}
 */
export function isEligibleForProductSampling( userId, percentage ) {
	if ( percentage >= 100 ) return true;
	const userSegment = userId % 100;

	return userSegment < percentage;
}
