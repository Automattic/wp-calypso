import stripTags from 'striptags';

/**
 * Strips HTML from a string. Does not handle tags nested in attribute strings.
 * @param  {string} string The string to strip tags from
 * @returns {string}        The stripped string
 */
export function stripHTML( string ) {
	return stripTags( string );
}
