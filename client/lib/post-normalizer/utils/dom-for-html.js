export function domForHtml( html ) {
	if ( typeof DOMParser !== 'undefined' && window.DOMParser.prototype.parseFromString ) {
		const parser = new window.DOMParser();
		const parsed = parser.parseFromString( html, 'text/html' );
		if ( parsed && parsed.body ) {
			return parsed.body;
		}
	}

	// DOMParser support is not present or non-standard
	const newDoc = document.implementation.createHTMLDocument( 'processing doc' );
	const dom = newDoc.createElement( 'div' );
	dom.innerHTML = html;

	return dom;
}
