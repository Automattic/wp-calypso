/**
 * Internal dependencies
 */
import getPDFSupport from './pdf-support';

let iframe = null;

/**
 * Loads the given URL in an invisible <iframe>
 * To do that, an invisible <iframe> is created, added to the current page, and "print()" is invoked
 * for just that iframe.
 *
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

const buildBlob = ( b64Content, mimeType ) => {
	const rawData = atob( b64Content );
	const rawDataLen = rawData.length;
	const binData = new Uint8Array( new ArrayBuffer( rawDataLen ) );
	for ( let i = 0; i < rawDataLen; i++ ) {
		binData[ i ] = rawData.charCodeAt( i );
	}
	return new Blob( [ binData ], { type: mimeType } );
};

/**
 * Opens the native printing dialog to print the given URL.
 * Falls back to opening the PDF in a new tab if opening the printing dialog is not supported.
 *
 * @param {object} fileData Object with the PDF contents. It needs to have at least these properties:
 * - {string} b64Content The PDF binary content, encoded in Base64
 * - {string} mimeType The MIME Type of the file. Normally it will be "application/pdf"
 * @param {string} fileName URL of the document to print
 * @returns {Promise} Promise that resolves if the printing dialog (or equivalent) was correctly
 * invoked, rejects otherwise.
 */
export default ( { b64Content, mimeType }, fileName ) => {
	const blob = buildBlob( b64Content, mimeType );
	const blobUrl = 'ie' !== getPDFSupport() ? URL.createObjectURL( blob ) : null; // IE has no use for "blob:" URLs

	switch ( getPDFSupport() ) {
		case 'native':
			// Happy case where everything can happen automatically. Supported in Chrome and Safari
			return loadDocumentInFrame( blobUrl ).then( () => {
				iframe.contentWindow.print();
				URL.revokeObjectURL( blobUrl );
			} );

		case 'addon':
			// window.open will be blocked by the browser if this code isn't being executed from a direct user interaction
			const success = window.open( blobUrl );
			setTimeout( () => URL.revokeObjectURL( blobUrl ), 1000 );
			return success
				? Promise.resolve()
				: Promise.reject( new Error( 'Unable to open label PDF in new tab' ) );

		case 'ie':
			// Internet Explorer / Edge don't allow to load "blob:" URLs into an <iframe> or a new tab. The only solution is to download
			return window.navigator.msSaveOrOpenBlob( blob, fileName )
				? Promise.resolve()
				: Promise.reject( new Error( 'Unable to download the PDF' ) );

		default:
			// If browser doesn't support PDFs at all, this will trigger the "Download" pop-up.
			// No need to wait for the iframe to load, it will never finish.
			loadDocumentInFrame( blobUrl );
			setTimeout( () => URL.revokeObjectURL( blobUrl ), 0 );
			return Promise.resolve();
	}
};
