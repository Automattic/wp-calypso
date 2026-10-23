import { useLayoutEffect, useRef } from 'react';

// A long title steps down from its size through these, so titles shrink by
// even amounts rather than to any size.
const SCALES = [ 1, 0.875, 0.75, 0.65 ];

/**
 * Fits a card title to its header, at the largest scale that keeps it inside
 * its own box, within `--resource-title-max-lines` when the stylesheet sets
 * one, and without breaking a word. A title too long even at the smallest
 * scale is clamped to the lines that fit, and marked `data-clamped`.
 *
 * Sets `--resource-title-scale` and `--resource-title-lines` on the title,
 * which holds its text in a single block-level child. Fits again whenever the
 * title's box resizes, its text changes, or the web fonts load.
 */
export function useFitTitle< T extends HTMLElement >( text: string ) {
	const ref = useRef< T >( null );

	useLayoutEffect( () => {
		const title = ref.current;
		const content = title?.firstElementChild;
		if ( ! title || ! ( content instanceof HTMLElement ) ) {
			return;
		}

		let fitted = { width: 0, height: 0 };

		// Whether the title fits at a scale, and the lines it has room for. The
		// content's scrollHeight, as a title in a fixed-height row clips it to
		// that row, and its scrollWidth, as only a word too wide for its line
		// overflows while words can't break.
		const measure = ( scale: number ) => {
			title.style.setProperty( '--resource-title-scale', String( scale ) );
			const lineHeight = parseFloat( getComputedStyle( content ).lineHeight );
			// Without layout, as in tests, leave the title at its full size.
			if ( ! lineHeight ) {
				return { fits: true, room: 0 };
			}
			const maxLines = parseInt(
				getComputedStyle( title ).getPropertyValue( '--resource-title-max-lines' )
			);
			const room = Math.min(
				maxLines || Infinity,
				Math.floor( title.getBoundingClientRect().height / lineHeight + 0.01 )
			);
			const lines = Math.round( content.scrollHeight / lineHeight );
			const breaksWord = content.scrollWidth > content.clientWidth + 1;
			return { fits: lines <= room && ! breaksWord, room };
		};

		const fit = () => {
			title.removeAttribute( 'data-clamped' );
			title.style.removeProperty( '--resource-title-lines' );
			title.style.overflowWrap = 'normal';
			let { fits, room } = measure( SCALES[ 0 ] );
			for ( const scale of SCALES.slice( 1 ) ) {
				if ( fits ) {
					break;
				}
				( { fits, room } = measure( scale ) );
			}
			title.style.removeProperty( 'overflow-wrap' );
			if ( ! fits ) {
				title.setAttribute( 'data-clamped', '' );
				title.style.setProperty( '--resource-title-lines', String( Math.max( 1, room ) ) );
			}
			const { width, height } = title.getBoundingClientRect();
			fitted = { width, height };
		};

		fit();

		// Fitting resizes a title that sets its own height, so skip the resize
		// that causes, rather than fitting again in a loop.
		const observer = new ResizeObserver( () => {
			const { width, height } = title.getBoundingClientRect();
			if ( Math.abs( width - fitted.width ) > 0.5 || Math.abs( height - fitted.height ) > 0.5 ) {
				fit();
			}
		} );
		observer.observe( title );
		document.fonts?.addEventListener( 'loadingdone', fit );

		return () => {
			observer.disconnect();
			document.fonts?.removeEventListener( 'loadingdone', fit );
		};
	}, [ text ] );

	return ref;
}
