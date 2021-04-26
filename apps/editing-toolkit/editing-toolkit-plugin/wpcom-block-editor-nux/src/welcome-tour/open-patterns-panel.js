// Simulate click that react responds to
const mouseClickEvents = [ 'mousedown', 'click', 'mouseup' ];
const simulateMouseClick = function ( element ) {
	mouseClickEvents.forEach( ( mouseEventType ) =>
		element.dispatchEvent(
			new window.MouseEvent( mouseEventType, {
				view: window,
				bubbles: true,
				cancelable: true,
				buttons: 1,
			} )
		)
	);
};

function getElementAsync( selector ) {
	return new Promise( ( resolve, reject ) => {
		const abortTimer = setTimeout( () => {
			reject( `The element ${ selector } was not found after 60 seconds.` );
		}, 60000 );
		const interval = setInterval( () => {
			const element = document.querySelector( selector );
			if ( element ) {
				clearTimeout( abortTimer );
				clearInterval( interval );
				resolve( element );
			}
		} );
	} );
}

export default function () {
	getElementAsync( '.edit-post-header-toolbar__inserter-toggle' ).then( ( inserterToggle ) => {
		simulateMouseClick( inserterToggle );
		getElementAsync(
			'.block-editor-inserter__tabs .components-tab-panel__tabs button:nth-child(2)'
		).then( ( patternsTab ) => {
			simulateMouseClick( patternsTab );
		} );
	} );
}
