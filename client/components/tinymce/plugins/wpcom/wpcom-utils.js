/**
 * Removes empty spaces from empty paragraphs
 * This logic is borrowed from core's TinyMCE Plugin
 *
 *
 *
 * @format
 * @see https:
 * @param {String}   content TinyMCE Editor content
 * @return {String}           Content with strings removed from empty paragraphs
 */

export function removeEmptySpacesInParagraphs( content ) {
	return content.replace( /<p>([^<>]+)<\/p>/gi, function( tag, text ) {
		if ( text === '&nbsp;' || ! /\S/.test( text ) ) {
			return '<p><br /></p>';
		}

		return tag;
	} );
}
