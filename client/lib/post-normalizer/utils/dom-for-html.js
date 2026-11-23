function createInertDocument() {
	if ( typeof DOMParser !== 'undefined' && window.DOMParser.prototype.parseFromString ) {
		// The doctype keeps the document out of quirks mode, which parses some markup differently.
		const parsed = new window.DOMParser().parseFromString( '<!DOCTYPE html>', 'text/html' );
		if ( parsed && parsed.body ) {
			return parsed;
		}
	}

	return document.implementation.createHTMLDocument( 'processing doc' );
}

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

/**
 * Parses HTML the way `innerHTML` on a `div` does, which is how the Reader renders post content,
 * but in a document with no browsing context, so nothing in it loads or runs. A DOMParser document
 * is preferred because it shares the page's URL, so relative links resolve as they will on render.
 * @param {string} html The HTML to parse
 * @returns {HTMLDivElement} A detached `div` holding the parsed nodes
 */
export function fragmentForHtml( html ) {
	const container = createInertDocument().createElement( 'div' );
	container.innerHTML = html;

	return container;
}
