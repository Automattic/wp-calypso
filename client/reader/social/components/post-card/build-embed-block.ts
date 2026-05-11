// Defence-in-depth: the permalink originates upstream-side but lands in
// the user's WordPress editor, so we re-validate the scheme. A bad URL
// degrades to an empty draft body rather than corrupt block markup.
export function buildEmbedBlock( url: string ): string {
	if ( ! /^https?:\/\//.test( url ) ) {
		return '';
	}
	return [
		`<!-- wp:embed {"url":"${ url }"} -->`,
		'<figure class="wp-block-embed"><div class="wp-block-embed__wrapper">',
		url,
		'</div></figure>',
		'<!-- /wp:embed -->',
	].join( '\n' );
}
