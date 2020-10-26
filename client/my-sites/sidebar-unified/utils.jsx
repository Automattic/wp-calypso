const masterbarHeight = document.getElementById( 'header' ).scrollHeight;
const secondaryEl = document.getElementById( 'secondary' );
let last_known_scroll_position = 0;
let ticking = false; // Used for Scroll event throttling.

export const handleScroll = () => {
	const windowHeight = window?.innerHeight;
	const sidebarEl = document.getElementById( 'sidebar' );
	const sidebarElHeight = sidebarEl?.scrollHeight;
	const sidebarOffset = -sidebarEl.getBoundingClientRect().top;

	if (
		! ticking &&
		typeof window !== 'undefined' &&
		sidebarEl !== 'undefined' &&
		sidebarEl !== null &&
		sidebarElHeight + masterbarHeight > windowHeight // Only run when sidebar & masterbar are taller than window height.
	) {
		// Throttle scroll event
		window.requestAnimationFrame( function () {
			const maxScroll = sidebarElHeight + masterbarHeight - windowHeight; // Max sidebar inner scroll.
			const scrollY = -document.body.getBoundingClientRect().top; // Get current scroll position.
			const amountScrolled = scrollY - last_known_scroll_position;

			console.log( `Window Height ${ windowHeight }` );
			console.log( `Sidebar Height ${ sidebarElHeight }` );
			console.log( `Current Scroll ${ scrollY }` );
			console.log( `Max Scroll ${ maxScroll }` );
			console.log( sidebarOffset );
			console.log( `Sidebar Top ${ sidebarOffset + scrollY }` );
			console.log( '------------------------------------' );

			if ( scrollY >= 0 && scrollY <= maxScroll ) {
				// We are moving DOWN. Scroll down the sidebar to current scroll position.
				sidebarEl.style.top = `-${ scrollY }px`;
			} else if ( scrollY > maxScroll && scrollY < last_known_scroll_position ) {
				// We are moving UP. Scroll up the sidebar for the amount scrolled.
				sidebarEl.style.top = 'inherit';
				sidebarEl.style.bottom = `${ amountScrolled }px`;
			} else {
				// Stick to sidebar bottom and don't overscroll.
				sidebarEl.style.top = 'inherit'; // Default style has bottom: 0.
			}
			last_known_scroll_position = scrollY;
			ticking = false;
		} );
	}
	ticking = true;
};
