import { useEffect, useState } from 'react';

/**
 * Offset (px) from the top of the scroll container to the top of the
 * virtualized list. When the list does not start at the very top of its scroll
 * container — e.g. a header or toolbar sits above it — the virtualizer needs
 * this as its `scrollMargin` so the scroll position maps to the right items.
 * Recomputes when either element resizes.
 */
export function useScrollMargin(
	listElement: HTMLElement | null,
	scrollElement: HTMLElement | null
): number {
	const [ margin, setMargin ] = useState( 0 );

	useEffect( () => {
		if ( ! listElement || ! scrollElement ) {
			return;
		}
		const measure = () => {
			const next =
				listElement.getBoundingClientRect().top -
				scrollElement.getBoundingClientRect().top +
				scrollElement.scrollTop;
			setMargin( ( current ) => ( current === next ? current : next ) );
		};
		measure();
		const observer = new ResizeObserver( measure );
		observer.observe( scrollElement );
		observer.observe( listElement );
		return () => observer.disconnect();
	}, [ listElement, scrollElement ] );

	return margin;
}
