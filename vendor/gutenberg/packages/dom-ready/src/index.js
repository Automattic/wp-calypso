/**
 * Specify a function to execute when the DOM is fully loaded.
 *
 * @param {Function} callback A function to execute after the DOM is ready.
 *
 * @return {void}
 */
const domReady = function( callback ) {
	if ( document.readyState === 'complete' ) {
		return callback();
	}

	document.addEventListener( 'DOMContentLoaded', callback );
};

export default domReady;
