/**
 * Removes `href` attributes from all anchor elements, prevents submit events from all forms, and removes all meta-redirects
 *
 * @param iframe The iframe you want to disable navigation for.
 */
export function disableNavigation( iframe: HTMLIFrameElement ) {
	const { contentDocument, contentWindow } = iframe;

	if ( contentDocument && contentWindow ) {
		iframe.addEventListener( 'load', () => {
			// dis-arm anchors
			contentDocument.body.querySelectorAll( 'a[href]' ).forEach( ( anchor: Element ) => {
				// we don't want to remove href attribute because styling can change without it
				// using only # will jump to top
				anchor.setAttribute( 'href', '#!' );
			} );

			// disarm forms
			contentDocument.body.querySelectorAll( 'form' ).forEach( form => {
				form.addEventListener( 'submit', ( event: Event ) => {
					event.preventDefault();
					return false;
				} );
			} );

			// remove meta redirects
			contentDocument.head
				.querySelectorAll( 'meta[http-equiv="refresh"]' )
				.forEach( ( element: Element ) => {
					element.parentNode?.removeChild( element ); // element.remove() doesn't work in IE
				} );
		} );
	}
}
