import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Debug aid for `useInfiniteList`: render alongside your list and pass the same
 * `scrollElement` you give the hook. When enabled it outlines that scroll
 * container and shows a badge with its tag/class and live
 * `clientHeight × scrollHeight × scrollTop` — handy for spotting a wrong or
 * unbounded container (the classic "renders every item / infinite-loads every
 * page" symptom, where `clientHeight ≈ scrollHeight`). Renders nothing when
 * disabled.
 *
 * Enable with `?scroll-debug` in the URL, or
 * `localStorage.setItem( 'reader-scroll-debug', '1' )`.
 */
const OUTLINE = '3px solid #e34c4c';

function isEnabled(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	if ( new URLSearchParams( window.location.search ).has( 'scroll-debug' ) ) {
		return true;
	}
	try {
		return window.localStorage.getItem( 'reader-scroll-debug' ) === '1';
	} catch {
		return false;
	}
}

function describe( el: HTMLElement | null ): string {
	if ( ! el ) {
		return 'scrollElement: null';
	}
	const classes = Array.from( el.classList ).join( '.' );
	const name = `${ el.tagName.toLowerCase() }${ classes ? `.${ classes }` : '' }`;
	return `${ name } · ${ el.clientHeight }×${ el.scrollHeight } · scrollTop ${ Math.round(
		el.scrollTop
	) }`;
}

export function ScrollDebugOverlay( { scrollElement }: { scrollElement: HTMLElement | null } ) {
	const enabled = isEnabled();
	// Bump on scroll/resize so the badge's live numbers stay fresh.
	const [ , forceUpdate ] = useState( 0 );

	useEffect( () => {
		if ( ! enabled || ! scrollElement ) {
			return;
		}
		const prevOutline = scrollElement.style.outline;
		const prevOffset = scrollElement.style.outlineOffset;
		scrollElement.style.outline = OUTLINE;
		scrollElement.style.outlineOffset = '-3px';

		const refresh = () => forceUpdate( ( n ) => n + 1 );
		scrollElement.addEventListener( 'scroll', refresh, { passive: true } );
		const observer = new ResizeObserver( refresh );
		observer.observe( scrollElement );

		return () => {
			scrollElement.style.outline = prevOutline;
			scrollElement.style.outlineOffset = prevOffset;
			scrollElement.removeEventListener( 'scroll', refresh );
			observer.disconnect();
		};
	}, [ enabled, scrollElement ] );

	if ( ! enabled || typeof document === 'undefined' ) {
		return null;
	}

	return createPortal(
		<div
			style={ {
				position: 'fixed',
				insetBlockEnd: 8,
				insetInlineStart: 8,
				zIndex: 99999,
				background: '#e34c4c',
				color: '#fff',
				font: '12px/1.4 ui-monospace, monospace',
				padding: '6px 10px',
				borderRadius: 6,
				pointerEvents: 'none',
				maxInlineSize: '90vw',
			} }
		>
			scroll container → { describe( scrollElement ) }
		</div>,
		document.body
	);
}
