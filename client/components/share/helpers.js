export const truncateArticleContent = ( maxCharacters, content ) => {
	if ( content.length <= maxCharacters ) {
		return content;
	}

	const truncated = content.slice( 0, maxCharacters );

	// don't trim off the last word if we truncated at
	// the end of the word
	if ( content[ maxCharacters + 1 ] === ' ' ) {
		return `${ content }…`;
	}

	const lastSpace = truncated.lastIndexOf( ' ' );
	return truncated.slice( 0, lastSpace ).concat( '…' );
};
