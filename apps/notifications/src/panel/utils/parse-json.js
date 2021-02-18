/**
 * Attempts to parse a string as JSON
 *
 * @param {?string} input possible JSON string
 * @returns {*} parsed data or null on failure
 */
export const parseJson = ( input ) => {
	try {
		return JSON.parse( input );
	} catch ( e ) {
		return null;
	}
};
