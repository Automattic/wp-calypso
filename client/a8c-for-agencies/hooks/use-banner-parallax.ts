import { useCallback, useEffect, useRef } from 'react';

// Fraction of scroll distance the banner translates downward. 0.3 means the
// banner slides down 30px for every 100px of page scroll, so the banner
// effectively scrolls up at 0.7 speed while the body scrolls at 1.0 — the
// body catches up and covers it from below.
const DEFAULT_PARALLAX_RATE = 0.3;

/**
 * Drives a parallax translate on the sticky banner by writing
 * `--banner-translate-y` (a px value) to the scroll container on each
 * animation frame. The custom property cascades down to the banner element,
 * whose CSS reads it via `transform: translateY(var(--banner-translate-y, 0))`.
 *
 * The banner itself is already `position: sticky; top: 0` and sits behind the
 * body's stacking context. This hook layers a downward translate on top of
 * that, so the banner appears to sink as the user scrolls while the body
 * slides up over it — the classic cover-style parallax effect, but without
 * fighting the scroll the way a state-toggling collapse would.
 *
 * Wire `onScroll` onto the scrollable container. No ref to the banner is
 * needed: the CSS variable cascades.
 */
export default function useBannerParallax( rate: number = DEFAULT_PARALLAX_RATE ) {
	const containerEl = useRef< HTMLElement | null >( null );
	const pendingScrollTop = useRef( 0 );
	const rafId = useRef< number | null >( null );

	useEffect( () => {
		return () => {
			if ( rafId.current !== null ) {
				cancelAnimationFrame( rafId.current );
			}
		};
	}, [] );

	const writeOffset = useCallback( () => {
		rafId.current = null;
		const el = containerEl.current;
		if ( ! el ) {
			return;
		}
		const offset = pendingScrollTop.current * rate;
		el.style.setProperty( '--banner-translate-y', `${ offset }px` );
	}, [ rate ] );

	const onScroll = useCallback(
		( event: React.UIEvent< HTMLDivElement > ) => {
			containerEl.current = event.currentTarget;
			pendingScrollTop.current = event.currentTarget.scrollTop;

			if ( rafId.current === null ) {
				rafId.current = requestAnimationFrame( writeOffset );
			}
		},
		[ writeOffset ]
	);

	return { onScroll };
}
