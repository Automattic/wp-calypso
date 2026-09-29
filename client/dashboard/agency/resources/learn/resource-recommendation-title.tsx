import { useLayoutEffect, useRef } from 'react';

/** Fit recommendation titles within a shared row without truncating their text. */
export default function ResourceRecommendationTitle( { title }: { title: string } ) {
	const containerRef = useRef< HTMLSpanElement >( null );
	const textRef = useRef< HTMLSpanElement >( null );

	useLayoutEffect( () => {
		const container = containerRef.current;
		const text = textRef.current;
		if ( ! container || ! text ) {
			return;
		}
		let active = true;
		const fit = () => {
			if ( ! active || ! container.clientWidth ) {
				return;
			}
			let lower = 18;
			let upper =
				parseFloat(
					getComputedStyle( container ).getPropertyValue( '--resource-title-max-size' )
				) || 34;
			while ( upper - lower > 0.5 ) {
				const size = ( lower + upper ) / 2;
				text.style.fontSize = `${ size }px`;
				if (
					text.scrollHeight <= container.clientHeight &&
					text.scrollWidth <= container.clientWidth
				) {
					lower = size;
				} else {
					upper = size;
				}
			}
			text.style.fontSize = `${ lower }px`;
		};
		const observer = new ResizeObserver( fit );
		observer.observe( container );
		document.fonts.addEventListener( 'loadingdone', fit );
		void document.fonts.ready.then( fit );
		fit();
		return () => {
			active = false;
			observer.disconnect();
			document.fonts.removeEventListener( 'loadingdone', fit );
		};
	}, [ title ] );

	return (
		<span className="resource-title-cover-heading" dir="auto" ref={ containerRef }>
			<span className="resource-recommendation-title-text" ref={ textRef }>
				{ title }
			</span>
		</span>
	);
}
