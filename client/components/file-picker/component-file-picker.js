/**
 * Module Dependencies
 */

import * as event from 'component-event';

/**
 * Input template
 */

let form;
let input;

function getFileInput() {
	if ( input ) {
		return input;
	}

	if ( typeof document === 'undefined' ) {
		return null;
	}

	form = document.createElement( 'form' );
	form.style.margin = '0px';
	form.innerHTML =
		'<input type="file" style="top: -1000px; position: absolute" aria-hidden="true" tabindex="-1">';
	document.body.appendChild( form );
	input = form.childNodes[ 0 ];

	return input;
}

/**
 * Already bound
 */

let bound = false;

/**
 * Opens a file picker dialog.
 * @param {Object} opts (optional)
 * @param {Function} fn callback function
 */
export default function FilePicker( opts, fn ) {
	if ( 'function' === typeof opts ) {
		fn = opts;
		opts = {};
	}
	opts = opts || {};

	const fileInput = getFileInput();
	if ( ! fileInput ) {
		return;
	}

	// multiple files support
	fileInput.multiple = !! opts.multiple;

	// directory support
	fileInput.webkitdirectory = fileInput.mozdirectory = fileInput.directory = !! opts.directory;

	// accepted file types support
	if ( null == opts.accept ) {
		delete fileInput.accept;
	} else if ( opts.accept.join ) {
		// got an array
		fileInput.accept = opts.accept.join( ',' );
	} else if ( opts.accept ) {
		// got a regular string
		fileInput.accept = opts.accept;
	}

	// listen to change event (unbind old one if already listening)
	if ( bound ) {
		event.unbind( fileInput, 'change', bound );
	}
	event.bind( fileInput, 'change', onchange );
	bound = onchange;

	function onchange( e ) {
		fn( fileInput.files, e, fileInput );
		event.unbind( fileInput, 'change', onchange );
		bound = false;
	}

	// reset the form
	form.reset();

	// trigger input dialog
	fileInput.click();
}
