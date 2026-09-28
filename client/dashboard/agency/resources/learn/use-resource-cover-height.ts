import { useLayoutEffect, useRef } from 'react';

/** Keep the title covers aligned without imposing a text-clipping fixed height. */
export default function useResourceCoverHeight() {
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		const library = ref.current;
		if ( ! library ) {
			return;
		}
		let frame = 0;
		let active = true;
		const measure = () => {
			library.style.removeProperty( '--resource-cover-height' );
			const covers = library.querySelectorAll< HTMLElement >(
				'.dataviews-view-grid .resource-title-cover'
			);
			const height = Math.max( 0, ...Array.from( covers, ( cover ) => cover.offsetHeight ) );
			if ( height ) {
				library.style.setProperty( '--resource-cover-height', `${ Math.ceil( height ) }px` );
			}
		};
		const schedule = () => {
			if ( ! active ) {
				return;
			}
			cancelAnimationFrame( frame );
			frame = requestAnimationFrame( measure );
		};
		let width = library.getBoundingClientRect().width;
		const resize = new ResizeObserver( ( entries ) => {
			const nextWidth = entries[ 0 ].contentRect.width;
			if ( nextWidth !== width ) {
				width = nextWidth;
				schedule();
			}
		} );
		resize.observe( library );
		const mutation = new MutationObserver( schedule );
		mutation.observe( library, { childList: true, subtree: true, characterData: true } );
		document.fonts.addEventListener( 'loadingdone', schedule );
		void document.fonts.ready.then( schedule );
		measure();
		return () => {
			active = false;
			cancelAnimationFrame( frame );
			resize.disconnect();
			mutation.disconnect();
			document.fonts.removeEventListener( 'loadingdone', schedule );
			library.style.removeProperty( '--resource-cover-height' );
		};
	}, [] );

	return ref;
}
