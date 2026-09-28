import { useLayoutEffect, useRef, useState } from 'react';

export default function useResourceCarousel( resourceKey: string ) {
	const ref = useRef< HTMLUListElement >( null );
	const [ edges, setEdges ] = useState( { start: true, end: true } );

	useLayoutEffect( () => {
		const list = ref.current;
		if ( ! list ) {
			return;
		}
		const section = list.parentElement;
		const page = list.closest( 'main' );
		const measure = () => {
			if ( section && page ) {
				const gutter = Math.max(
					0,
					( page.getBoundingClientRect().width - section.getBoundingClientRect().width ) / 2
				);
				list.style.setProperty( '--resource-carousel-gutter', `${ gutter }px` );
			}
			const bounds = list.getBoundingClientRect();
			const first = list.firstElementChild?.getBoundingClientRect();
			const last = list.lastElementChild?.getBoundingClientRect();
			const style = getComputedStyle( list );
			const rtl = style.direction === 'rtl';
			const start = bounds.left + parseFloat( style.paddingLeft );
			const end = bounds.right - parseFloat( style.paddingRight );
			const next = {
				start: ! first || ( rtl ? first.right <= end + 2 : first.left >= start - 2 ),
				end: ! last || ( rtl ? last.left >= start - 2 : last.right <= end + 2 ),
			};
			setEdges( ( current ) =>
				current.start === next.start && current.end === next.end ? current : next
			);
		};
		list.scrollTo( { left: 0, behavior: 'instant' } );
		measure();
		list.addEventListener( 'scroll', measure, { passive: true } );
		const observer = new ResizeObserver( measure );
		observer.observe( list );
		if ( page ) {
			observer.observe( page );
		}
		return () => {
			list.removeEventListener( 'scroll', measure );
			observer.disconnect();
		};
	}, [ resourceKey ] );

	const scroll = ( direction: number ) => {
		const list = ref.current;
		if ( ! list ) {
			return;
		}
		const style = getComputedStyle( list );
		const distance =
			( list.firstElementChild?.getBoundingClientRect().width ?? 0 ) +
			parseFloat( style.columnGap );
		list.scrollBy( {
			left: direction * distance * ( style.direction === 'rtl' ? -1 : 1 ),
			behavior: window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
				? 'instant'
				: 'smooth',
		} );
	};

	return { ref, edges, scroll };
}
