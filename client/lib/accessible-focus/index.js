var keyboardNavigation = false,
	keyboardNavigationKeycodes = [ 9, 32, 37, 38, 39, 40 ]; // keyCodes for tab, space, left, up, right, down respectively

function accessibleFocus() {
	document.addEventListener( 'keydown', function( event ) {
		if ( keyboardNavigation ) {
			return;
		}
		if ( keyboardNavigationKeycodes.indexOf( event.keyCode ) !== -1 ) {
			keyboardNavigation = true;
			document.documentElement.classList.add( 'accessible-focus' );
		}
	} );
	document.addEventListener( 'mouseup', function() {
		if ( ! keyboardNavigation ) {
			return;
		}
		keyboardNavigation = false;
		document.documentElement.classList.remove( 'accessible-focus' );
	} );
}

module.exports = accessibleFocus;
