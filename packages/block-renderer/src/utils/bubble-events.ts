/**
 * Bubble the events to the parent window
 */
const bubbleEvents = ( element: Element, eventNames: string[] ) => {
	const currentWindow = element.ownerDocument.defaultView;
	if ( ! currentWindow || currentWindow === currentWindow.top ) {
		return;
	}

	for ( const eventName of eventNames ) {
		currentWindow.addEventListener( eventName, ( event ) => {
			currentWindow.parent?.dispatchEvent( new Event( event.type ) );
		} );
	}
};

export default bubbleEvents;
