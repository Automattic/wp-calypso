/**
 * Parses an HTML string into a DOM element. Uses `DOMParser` when available,
 * falling back to `document.implementation.createHTMLDocument` for environments
 * where `DOMParser` is absent or non-standard.
 *
 * @param {string} html - The HTML string to parse.
 * @returns {HTMLElement} A DOM element whose `innerHTML` contains the parsed HTML.
 *   When `DOMParser` is available this is the `<body>` element of the parsed document;
 *   otherwise it is a `<div>` element created via `createHTMLDocument`.
 */
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
