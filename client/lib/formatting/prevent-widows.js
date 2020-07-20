/**
 * Prevent widows by replacing spaces between the last `wordsToKeep` words in the text with non-breaking spaces
 *
 * @param  {string|@i18n-calypso/TranslateResult} text the text to work on
 * @param  {number} wordsToKeep the number of words to keep together
 * @returns {string}             the widow-prevented string
 */
export function preventWidows( text, wordsToKeep = 2 ) {
	if ( typeof text !== 'string' ) {
		if ( Array.isArray( text ) ) {
			// Handle strings with interpolated components by only acting on the last element.
			if ( typeof text[ text.length - 1 ] === 'string' ) {
				const endingText = text.pop();
				const startingWhitespace = endingText.match( /^\s+/ );
				// The whitespace between component and text would be stripped by preventWidows.
				startingWhitespace && text.push( startingWhitespace[ 0 ] );
				text.push( preventWidows( endingText, wordsToKeep ) );
			}
		}
		return text;
	}

	text = text && text.trim();
	if ( ! text ) {
		return text;
	}

	const words = text.match( /\S+/g );
	if ( ! words || 1 === words.length ) {
		return text;
	}

	if ( words.length <= wordsToKeep ) {
		return words.join( '\xA0' );
	}

	const endWords = words.splice( -wordsToKeep, wordsToKeep );

	return words.join( ' ' ) + ' ' + endWords.join( '\xA0' );
}
