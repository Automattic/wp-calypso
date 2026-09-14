import 'calypso/state/purchases/init';

/**
 * Returns the server error for site or user purchases (if there is one)
 * @param   {Object} state - current state object
 * @returns {Object} an error object from the server
 */
export const getPurchasesError = ( state ) => {
	// Fall back only when the value is absent, not when it is a terminal null.
	const error = state?.purchases?.error;
	return error === undefined ? '' : error;
};
