/**
 * External dependencies
 */
import { get, includes, memoize } from 'lodash';

/**
 * This function result is cached for performance reasons, since browser capabilities won't change.
 *
 * @returns {string|false} "native" if the browser can display PDFs and code can reliably call JS
 * functions on those PDFs (such as print()). "addon" if the browser can display PDFs, but there's
 * no guarantee that they will respond to a DOM-like API. false if the browser can't display
 * PDFs at all.
 */
export default memoize( () => {
	if ( get( window, 'navigator.msSaveOrOpenBlob' ) ) {
		// IE & Edge, they don't support opening a Blob in an iframe/window
		return 'ie';
	}

	if ( /iPad|iPhone|iPod/.test( navigator.userAgent ) && ! window.MSStream ) {
		// iOS doesn't support triggering a print dialog, so we should load the pdf in a new tab
		// instead. Windows Phones are filtered out with `! window.MSStream` since the user agent
		// string can contain the false positive 'like iPhone'
		return 'addon';
	}

	if ( includes( navigator.userAgent, 'Firefox' ) ) {
		// Firefox has a long-lived bug (https://bugzilla.mozilla.org/show_bug.cgi?id=911444),
		// it's not reliable to consider its PDF reader "native"
		return 'addon';
	}

	if ( navigator.mimeTypes[ 'application/pdf' ] ) {
		return 'native';
	}

	const getActiveXObject = ( name ) => {
		try {
			return new ActiveXObject( name ); /*eslint no-undef: 0 */
		} catch ( e ) {
			// Ignore
		}
	};

	if ( getActiveXObject( 'AcroPDF.PDF' ) || getActiveXObject( 'PDF.PdfCtrl' ) ) {
		// IE with a PDF reader plugin installed
		return 'addon';
	}

	return false;
} );
