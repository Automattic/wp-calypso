// Helper function for keyboard-equivalents of onClick events

/**
 * Helper function which triggers a callback on a keydown event, only
 * if the key pressed is space or enter - to mirror button functionality.
 *
 * @param {Function} callback A callback function
 * @return {Function} the callback to fire on a keydown event
 */
export default function( callback ) {
	return ( event ) => {
		if ( event.which === 13 || event.which === 32 ) {
			callback( event );
		}
	};
}
