/**
 * Removes items matched in the regex.
 *
 * @param {Object} settings The main settings object containing regular expressions
 * @param {string} text     The string being counted.
 *
 * @return {string} The manipulated text.
 */
export default function( settings, text ) {
	if ( settings.HTMLcommentRegExp ) {
		return text.replace( settings.HTMLcommentRegExp, '' );
	}
	return text;
}
