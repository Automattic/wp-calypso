/**
 * Parses and returns the query parameters from the URL
 * @returns An object with the query parameters
 */
export const getQuery = () => {
	return Object.fromEntries( new URLSearchParams( window.location.search ) );
};
