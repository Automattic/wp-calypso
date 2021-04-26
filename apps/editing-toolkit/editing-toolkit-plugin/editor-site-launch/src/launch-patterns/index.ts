/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( async () => {
	// If site launch options does not exist, stop.
	if ( ! window.wpcomEditorSiteLaunch?.isBlankCanvas ) return;

	// Simulate click that react responds to
	const mouseClickEvents = [ 'mousedown', 'click', 'mouseup' ];
	const simulateMouseClick = function ( element: Element ) {
		mouseClickEvents.forEach( ( mouseEventType ) =>
			element.dispatchEvent(
				new MouseEvent( mouseEventType, {
					view: window,
					bubbles: true,
					cancelable: true,
					buttons: 1,
				} )
			)
		);
	};

	async function getElementAsync( selector: string ): Promise< Element | null > {
		return await new Promise( ( resolve, reject ) => {
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

	// Click the inserter button
	const inserterToggle = await getElementAsync( '.edit-post-header-toolbar__inserter-toggle' );

	inserterToggle && simulateMouseClick( inserterToggle );

	// Click the patterns tabs
	const patternsTab = await getElementAsync( '#tab-panel-0-patterns' );

	patternsTab && simulateMouseClick( patternsTab );
} );
