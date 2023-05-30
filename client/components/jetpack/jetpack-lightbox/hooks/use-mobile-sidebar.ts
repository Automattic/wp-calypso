import { useLayoutEffect, useRef, useState } from 'react';

const MOBILE_BREAKPOINT = 782;

const useMobileSidebar = () => {
	// We need to wait for ReactModal to render elements to get access to refs properly
	const [ isInitialized, setIsInitialized ] = useState( false );
	const [ clientWidth, setClientWidth ] = useState( window.innerWidth );

	const sidebarRef = useRef< HTMLDivElement | null >( null );
	const mainRef = useRef< HTMLDivElement | null >( null );

	// Monitor current viewport width to unload hook when on desktop
	useLayoutEffect( () => {
		const onResize = () => setClientWidth( window.innerWidth );
		window.addEventListener( 'resize', onResize );

		return () => {
			window.removeEventListener( 'resize', onResize );
		};
	} );

	useLayoutEffect( () => {
		const { current: sidebar } = sidebarRef;
		const { current: mainDiv } = mainRef;

		if ( clientWidth <= MOBILE_BREAKPOINT && sidebar && mainDiv ) {
			// Fetch initial padding bottom set in styles
			const mainDivPaddingBottom = window.getComputedStyle( mainDiv ).paddingBottom;

			// Watch for changes in sidebar height (i.e. due to lazy loading of prices)
			const sidebarObserver = new ResizeObserver( () => {
				const rect = sidebar.getBoundingClientRect();
				mainDiv.style.paddingBottom = `calc( ${ rect.height }px + ${ mainDivPaddingBottom } )`;
			} );

			sidebarObserver.observe( sidebar );

			const onScroll = () => {
				// Show sidebar when user scrolls past half of the content (or when there is not enough to scroll)
				const sidebarThreshold = ( mainDiv.scrollHeight - mainDiv.clientHeight ) / 2;

				if ( mainDiv.scrollTop + 50 >= sidebarThreshold ) {
					sidebar.classList.add( 'is-expanded' );
				} else {
					sidebar.classList.remove( 'is-expanded' );
				}
			};

			// Show/hide sidebar on mount
			onScroll();

			// Check for changes in attributes for details content (i.e. when toggling visibility of sections)
			const mainDivObserver = new MutationObserver( onScroll );
			mainDivObserver.observe( mainDiv, { subtree: true, attributes: true } );

			mainDiv.addEventListener( 'scroll', onScroll );

			return () => {
				// Unload everything and reset styles
				mainDiv.style.paddingBottom = '';

				mainDiv.removeEventListener( 'scroll', onScroll );
				mainDivObserver.disconnect();
				sidebarObserver.disconnect();
			};
		}
	}, [ clientWidth, isInitialized ] );

	return { sidebarRef, mainRef, initMobileSidebar: () => setIsInitialized( true ) };
};

export default useMobileSidebar;
