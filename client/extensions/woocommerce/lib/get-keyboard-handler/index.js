/**
 * Accessibility helper function for lists of navigation items which have onClick events.
 * This triggers a callback on a keydown event, only if the key pressed is space or enter
 * to mirror button functionality. It will also focus the next/previous sibling (if one
 * exists) if the down/up arrows are pressed.
 *
 *
 * @param {Function} callback A callback function
 * @returns {Function} the callback to fire on a keydown event
 */

export default function ( callback ) {
	return ( event ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			callback( event );
		} else if ( event.key === 'ArrowDown' ) {
			if ( event.target.nextSibling ) {
				event.preventDefault();
				event.target.nextSibling.focus();
			}
		} else if ( event.key === 'ArrowUp' ) {
			if ( event.target.previousSibling ) {
				event.preventDefault();
				event.target.previousSibling.focus();
			}
		}
	};
}
