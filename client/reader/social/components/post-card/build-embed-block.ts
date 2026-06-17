// Defence-in-depth: the permalink originates upstream-side but lands in
// the user's WordPress editor, so we re-validate the scheme and escape the
// URL for both the JSON-in-HTML-comment header and the figure body. A bad
// URL degrades to an empty draft body rather than corrupt block markup.
export function buildEmbedBlock( url: string ): string {
	if ( ! /^https?:\/\//.test( url ) ) {
		return '';
	}
	// `-->` / `<!--` inside the URL would terminate the wp:embed comment
	// early. They're not legal characters in real-world permalinks, so the
	// safe fallback is to refuse the embed.
	if ( url.includes( '-->' ) || url.includes( '<!--' ) ) {
		return '';
	}
	const escapedUrl = url.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
	return [
		`<!-- wp:embed ${ JSON.stringify( { url } ) } -->`,
		'<figure class="wp-block-embed"><div class="wp-block-embed__wrapper">',
		escapedUrl,
		'</div></figure>',
		'<!-- /wp:embed -->',
	].join( '\n' );
}
