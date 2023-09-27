/**
 * Parses HTML by using the browser's built in string to DOM converter.
 * @param  {string} html HTML String to be converted into DOM fragment
 * @returns {window.DocumentFragment} DOM fragment that can be queried using built in browser functions.
 */
export function parseHtml( html ) {
	if ( html && html.querySelector ) {
		return html;
	}

	if ( 'string' !== typeof html ) {
		return null;
	}

	// Element is a string and should be parsed
	const el = document.createElement( 'div' );
	el.innerHTML = html;

	const elements = el.children;
	const fragment = document.createDocumentFragment();

	// From https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild:
	// "If the given child is a reference to an existing node in the document,
	// appendChild() moves it from its current position to the new position."
	// i.e. `elements` nodes will move to `fragment`'s children.
	while ( elements.length > 0 ) {
		fragment.appendChild( elements[ 0 ] );
	}

	return fragment;
}
