/**
 * Replaces items matched in the regex with spaces.
 *
 * @param {Object} settings The main settings object containing regular expressions
 * @param {string} text     The string being counted.
 *
 * @return {string} The manipulated text.
 */
export default function( settings, text ) {
	if ( settings.spaceRegExp ) {
		return text.replace( settings.spaceRegExp, ' ' );
	}
}
