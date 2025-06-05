/**
 * Parses and returns the query parameters from the URL
 */
export const getCurrentQueryParams = () => new URLSearchParams( window.location.search );
