// Convert the composer's plain-text body into Gutenberg paragraph blocks
// so the editor opens with structured content rather than a single Classic
// block. Blank lines separate paragraphs; single newlines inside a
// paragraph become `<br>`. Returns an empty string for whitespace-only
// input — `saveDraftMutation` substitutes its own empty-paragraph
// placeholder in that case.
function escapeHtml( s: string ): string {
	return s.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

export function buildParagraphBlocks( text: string ): string {
	const normalized = text.replace( /\r\n?/g, '\n' );
	if ( normalized.trim() === '' ) {
		return '';
	}
	const paragraphs = normalized
		.split( /\n[\t ]*\n+/ )
		.map( ( p ) => p.replace( /^\n+|\n+$/g, '' ) )
		.filter( ( p ) => p.trim().length > 0 );
	return paragraphs
		.map( ( p ) => {
			const inner = escapeHtml( p ).split( '\n' ).join( '<br>' );
			return `<!-- wp:paragraph -->\n<p>${ inner }</p>\n<!-- /wp:paragraph -->`;
		} )
		.join( '\n\n' );
}
