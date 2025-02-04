/**
 * Remove the starting https, www. and trailing slash from a URL string
 * @param {string} url URL to format
 * @returns {string|undefined} Formatted URL e.g. "https://www.wordpress.com/" --> "wordpress.com"
 */
export function formatUrlForDisplay( url ) {
	if ( ! url ) {
		return;
	}

	return url.replace( /^https?:\/\/(www\.)?/, '' ).replace( /\/$/, '' );
}
