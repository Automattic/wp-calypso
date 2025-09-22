/**
 * Creates a temporary live region announcement for screen readers
 * @param message - The message to announce
 * @param delay - Delay before announcing (default 100ms)
 */
export function announceToScreenReader( message: string, delay = 100 ): void {
	const announcement = document.createElement( 'div' );
	announcement.setAttribute( 'aria-live', 'polite' );
	announcement.setAttribute( 'aria-atomic', 'true' );

	// Visually hide the element while keeping it accessible to screen readers
	announcement.style.position = 'absolute';
	announcement.style.left = '-10000px';
	announcement.style.width = '1px';
	announcement.style.height = '1px';
	announcement.style.overflow = 'hidden';

	document.body.appendChild( announcement );

	// Announce the message after a short delay
	setTimeout( () => {
		announcement.textContent = message;
	}, delay );

	// Clean up after announcement (3 seconds)
	setTimeout( () => {
		if ( document.body.contains( announcement ) ) {
			document.body.removeChild( announcement );
		}
	}, 3000 );
}
