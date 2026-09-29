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
			const covers = library.querySelectorAll< HTMLElement >(
				'.dataviews-view-grid .resource-title-cover'
			);
			// Measure out of flow so scroll anchoring never sees the cards shrink.
			const copies = Array.from( covers, ( cover ) => {
				const copy = cover.cloneNode( true ) as HTMLElement;
				copy.setAttribute( 'data-cover-measurement', '' );
				copy.setAttribute( 'aria-hidden', 'true' );
				copy.inert = true;
				copy.style.setProperty( '--resource-cover-height', 'initial' );
				Object.assign( copy.style, {
					position: 'fixed',
					visibility: 'hidden',
					pointerEvents: 'none',
					inset: '0 auto auto 0',
					inlineSize: `${ cover.offsetWidth }px`,
				} );
				cover.parentElement?.appendChild( copy );
				return copy;
			} );
			const height = Math.max( 0, ...copies.map( ( copy ) => copy.offsetHeight ) );
			copies.forEach( ( copy ) => copy.remove() );
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
		const mutation = new MutationObserver( ( records ) => {
			const changesGrid = records.some( ( record ) => {
				const nodes = [ ...record.addedNodes, ...record.removedNodes ];
				if (
					nodes.length &&
					nodes.every(
						( node ) => node instanceof Element && node.hasAttribute( 'data-cover-measurement' )
					)
				) {
					return false;
				}
				const target =
					record.target instanceof Element ? record.target : record.target.parentElement;
				return (
					!! target?.closest( '.dataviews-view-grid' ) ||
					nodes.some(
						( node ) =>
							node instanceof Element &&
							( node.matches( '.dataviews-view-grid' ) ||
								node.querySelector( '.dataviews-view-grid' ) )
					)
				);
			} );
			if ( changesGrid ) {
				schedule();
			}
		} );
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
