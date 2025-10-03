/**
 * Module Dependencies
 */

const event = require( 'component-event' );

/**
 * Expose `FilePicker`
 */

module.exports = FilePicker;

/**
 * Input template
 */

const form = document.createElement( 'form' );
form.style.margin = '0px';
form.innerHTML =
	'<input type="file" style="top: -1000px; position: absolute" aria-hidden="true" tabindex="-1">';
document.body.appendChild( form );
const input = form.childNodes[ 0 ];

/**
 * Already bound
 */

let bound = false;

/**
 * Opens a file picker dialog.
 * @param {Object} options (optional)
 * @param {Function} fn callback function
 */

function FilePicker( opts, fn ) {
	if ( 'function' === typeof opts ) {
		fn = opts;
		opts = {};
	}
	opts = opts || {};

	// multiple files support
	input.multiple = !! opts.multiple;

	// directory support
	input.webkitdirectory = input.mozdirectory = input.directory = !! opts.directory;

	// accepted file types support
	if ( null == opts.accept ) {
		delete input.accept;
	} else if ( opts.accept.join ) {
		// got an array
		input.accept = opts.accept.join( ',' );
	} else if ( opts.accept ) {
		// got a regular string
		input.accept = opts.accept;
	}

	// listen to change event (unbind old one if already listening)
	if ( bound ) {
		event.unbind( input, 'change', bound );
	}
	event.bind( input, 'change', onchange );
	bound = onchange;

	function onchange( e ) {
		fn( input.files, e, input );
		event.unbind( input, 'change', onchange );
		bound = false;
	}

	// reset the form
	form.reset();

	// trigger input dialog
	input.click();
}
