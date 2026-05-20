import { useEffect } from 'react';
import type { RefObject } from 'react';

interface Options {
	enabled: boolean;
	sidebarRef: RefObject< HTMLElement | null >;
	navigatorRef: RefObject< HTMLElement | null >;
}

/**
 * Mirrors v1's SidebarScrollSynchronizer (client/layout/utils.ts) — a tall
 * sidebar should appear to scroll along with the page until its bottom reaches
 * the viewport bottom, then pin there.
 *
 * The sidebar is always `position: fixed`; this hook only adjusts `top`. As the
 * page scrolls, top is `max(viewport - sidebarHeight, omnibar - scrollY)`,
 * which clamps the sidebar's bottom to the viewport bottom and removes the
 * jumps you'd get from toggling between fixed and absolute positioning.
 */
export function useSidebarScrollSync( { enabled, sidebarRef, navigatorRef }: Options ) {
	useEffect( () => {
		if ( ! enabled ) {
			return;
		}
		let cachedSidebarHeight = 0;
		let cachedOmnibarHeight = 0;
		let scheduled = false;

		const getOmnibar = () => document.getElementById( 'wpcom-omnibar' );

		const measure = () => {
			const sidebar = sidebarRef.current;
			const omnibar = getOmnibar();
			if ( ! sidebar || ! omnibar ) {
				return;
			}
			// Read scrollHeight without our inline `height` interfering.
			const prevHeight = sidebar.style.height;
			sidebar.style.height = '';
			cachedSidebarHeight = sidebar.scrollHeight;
			cachedOmnibarHeight = omnibar.getBoundingClientRect().height;
			sidebar.style.height = prevHeight;
		};

		const apply = () => {
			scheduled = false;
			const sidebar = sidebarRef.current;
			if ( ! sidebar ) {
				return;
			}

			const sH = cachedSidebarHeight;
			const oH = cachedOmnibarHeight;
			const wH = window.innerHeight;
			const body = document.body;

			if ( sH + oH <= wH ) {
				// Sidebar fits in the viewport — let the CSS defaults apply.
				sidebar.removeAttribute( 'style' );
				body.style.minHeight = '';
				return;
			}

			// Ensure the page can scroll far enough to reveal the entire sidebar.
			const minBodyHeight = sH + oH;
			if ( body.scrollHeight < minBodyHeight ) {
				body.style.minHeight = `${ minBodyHeight }px`;
			}

			const scrollY = -body.getBoundingClientRect().top;
			const top = Math.max( wH - sH, oH - scrollY );
			sidebar.style.top = `${ top }px`;
			sidebar.style.bottom = 'auto';
			sidebar.style.height = `${ sH }px`;
		};

		const schedule = () => {
			if ( scheduled ) {
				return;
			}
			scheduled = true;
			window.requestAnimationFrame( apply );
		};

		// One observer for everything that could invalidate our cached
		// measurements:
		// - the inner navigator: SidebarNavigator swaps screens between
		//   routes and each screen has a different content height. We
		//   observe the navigator rather than the sidebar itself because
		//   when the sidebar overflows, this hook pins `style.height` on
		//   the sidebar, so its box-size stops reflecting content changes.
		// - the omnibar: its height changes at the responsive breakpoint.
		// - documentElement: stands in for window resize.
		const resizeObserver = new ResizeObserver( () => {
			measure();
			schedule();
		} );
		resizeObserver.observe( document.documentElement );

		// Initial measurement may need to wait for the omnibar to mount.
		const initId = window.requestAnimationFrame( () => {
			measure();
			schedule();
			if ( navigatorRef.current ) {
				resizeObserver.observe( navigatorRef.current );
			}
			const omnibar = getOmnibar();
			if ( omnibar ) {
				resizeObserver.observe( omnibar );
			}
		} );

		window.addEventListener( 'scroll', schedule, { passive: true } );

		return () => {
			window.cancelAnimationFrame( initId );
			window.removeEventListener( 'scroll', schedule );
			resizeObserver.disconnect();
			sidebarRef.current?.removeAttribute( 'style' );
			document.body.style.minHeight = '';
		};
	}, [ enabled, sidebarRef, navigatorRef ] );
}
