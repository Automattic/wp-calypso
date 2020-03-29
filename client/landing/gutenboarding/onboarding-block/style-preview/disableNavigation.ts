/**
 * Changes href attributes' values to "#!" and removes meta-redirect tags.
 *
 * @param contentDocument the document you want to process
 */
export function disarmAnchorsAndMetaRefreshes( contentDocument: HTMLDocument ) {
	// dis-arm anchors
	contentDocument.body
		?.querySelectorAll( 'a[href]:not([href="#!"])' )
		.forEach( ( anchor: Element ) => {
			// we don't want to remove href attribute because styling can change without it
			// using only # will jump to top
			anchor.setAttribute( 'href', '#!' );
		} );

	// remove meta redirects
	contentDocument.head
		?.querySelectorAll( 'meta[http-equiv="refresh"]' )
		.forEach( ( element: Element ) => {
			element.parentNode?.removeChild( element ); // element.remove() doesn't work in IE
		} );
}

/**
 * Handles all submit events in hte iframe and prevents their default behavior.
 * Also it handles `load` event for the iframe and calls {@link disarmAnchorsAndMetaRefreshes} on the iframe document when it fires
 *
 * @param iframe The iframe you want to process
 */
export function disableNavigation( iframe: HTMLIFrameElement ) {
	const { contentDocument, contentWindow } = iframe;

	if ( contentDocument && contentWindow ) {
		// submit event bubbles up, we only need to catch it on the window level
		contentWindow.addEventListener( 'submit', ( event: Event ) => {
			event.preventDefault();
			return false;
		} );

		// run again after the iframe loads
		iframe.addEventListener( 'load', () => disarmAnchorsAndMetaRefreshes( contentDocument ) );
	}
}
