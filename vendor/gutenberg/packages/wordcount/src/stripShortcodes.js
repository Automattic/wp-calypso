/**
 * Replaces items matched in the regex with a new line.
 *
 * @param {Object} settings The main settings object containing regular expressions
 * @param {string} text     The string being counted.
 *
 * @return {string} The manipulated text.
 */
export default function( settings, text ) {
	if ( settings.shortcodesRegExp ) {
		return text.replace( settings.shortcodesRegExp, '\n' );
	}
	return text;
}
