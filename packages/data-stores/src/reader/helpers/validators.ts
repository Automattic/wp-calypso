/**
 * This function checks if a given ID is valid.
 * @param {number | string | undefined} id - The ID to be validated. It can be of type number, string, or undefined.
 * @returns {boolean} The function returns true if the ID is valid, false otherwise.
 *
 * An ID is considered valid if it meets the following criteria:
 * - If it's a number, it must be a positive integer (including 0).
 * - If it's a string, it must contain only digits and represent a positive integer (including 0) when converted to a number.
 *
 * If the ID is undefined or does not meet the above criteria, the function returns false.
 */
export const isValidId = ( id?: unknown ): id is number | string => {
	if ( id === undefined ) {
		return false;
	}

	if ( typeof id === 'number' ) {
		return Number.isInteger( id ) && id >= 0;
	}

	if ( typeof id === 'string' ) {
		// Check if the string contains only digits
		const isOnlyDigits = /^[0-9]+$/.test( id );
		if ( isOnlyDigits ) {
			// If it contains only digits, convert it to a number and check if it's a positive integer or 0
			const num = Number( id );
			return Number.isInteger( num ) && num >= 0;
		}
	}

	return false;
};

export default isValidId;
