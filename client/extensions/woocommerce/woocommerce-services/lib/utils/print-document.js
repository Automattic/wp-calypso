/**
 * Internal dependencies
 */
import getPDFSupport from './pdf-support';

let iframe = null;

/**
 * Loads the given URL in an invisible <iframe>
 * To do that, an invisible <iframe> is created, added to the current page, and "print()" is invoked
 * for just that iframe.
 * @param {string} url URL to load
 * @returns {Promise} Promise that resolves when the iframe finished loading, rejects on error
 */
const loadDocumentInFrame = ( url ) => {
	return new Promise( ( resolve, reject ) => {
		if ( iframe ) {
			document.body.removeChild( iframe );
		}
		iframe = document.createElement( 'iframe' );
		iframe.src = url;

		// Note: Don't change this for "display: none" or it will stop working on MS Edge
		iframe.style.position = 'fixed';
		iframe.style.left = '-999px';

		iframe.onload = () => {
			resolve();
		};
		iframe.onerror = ( error ) => {
			reject( error );
		};

		document.body.appendChild( iframe );
	} );
};

/**
 * Opens the native printing dialog to print the given URL.
 * Falls back to opening the PDF in a new tab if opening the printing dialog is not supported.
 * @param {string} url URL of the document to print
 * @returns {Promise} Promise that resolves if the printing dialog (or equivalent) was correctly
 * invoked, rejects otherwise.
 */
export default ( url ) => {
	switch ( getPDFSupport() ) {
		case 'native':
			// Happy case where everything can happen automatically. Supported in Edge, Chrome and Safari
			return loadDocumentInFrame( url )
				.then( () => {
					iframe.contentWindow.print();
				} );

		case 'addon':
			// window.open will be blocked by the browser if this code isn't being executed from a direct user interaction
			return window.open( url ) ? Promise.resolve() : Promise.reject( new Error( 'Unable to open label PDF in new tab' ) );

		default:
			// If browser doesn't support PDFs at all, this will trigger the "Download" pop-up.
			// No need to wait for the iframe to load, it will never finish.
			loadDocumentInFrame( url );
			return Promise.resolve();
	}
};
