/**
 * Calculates the estimated time in minutes to read a piece of content.
 * @param {number} words Number of words to calculate reading time for
 * @returns {number} Estimated minutes to read. Returns 0 if words is not a number or less than or equal to 0. Results will be a whole number with minimum value of 1 if valid input.
 */
export function calcMinutesToRead( words: number = 0 ): number {
	if ( typeof words !== 'number' || words <= 0 || isNaN( words ) ) {
		return 0;
	}

	/*
	 * Average reading rate of words per minute - based on average taken from
	 * https://irisreading.com/average-reading-speed-in-various-languages/
	 */
	const avgReadingRate = 189;

	return Math.ceil( Math.max( 1, words / avgReadingRate ) );
}
