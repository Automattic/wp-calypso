import { useEffect } from 'react';

/**
 * Mirrors v1's SidebarScrollSynchronizer (client/layout/utils.ts) — a tall
 * sidebar should appear to scroll along with the page until its bottom reaches
 * the viewport bottom, then pin there.
 *
 * The sidebar is always `position: fixed`; this hook only adjusts `top`. As the
 * page scrolls, top is `max(viewport - sidebarHeight, masterbar - scrollY)`,
 * which clamps the sidebar's bottom to the viewport bottom and removes the
 * jumps you'd get from toggling between fixed and absolute positioning.
 */
export function useSidebarScrollSync( enabled: boolean = true ) {
	useEffect( () => {
		if ( ! enabled ) {
			return;
		}
		let cachedSidebarHeight = 0;
		let cachedMasterbarHeight = 0;
		let scheduled = false;

		const getEls = () => ( {
			sidebar: document.querySelector< HTMLElement >( '.dashboard-responsive-sidebar__sidebar' ),
			content: document.querySelector< HTMLElement >( '.dashboard-root__content' ),
			masterbar: document.querySelector< HTMLElement >( '#wpcom-omnibar' ),
		} );

		const measure = () => {
			const { sidebar, masterbar } = getEls();
			if ( ! sidebar || ! masterbar ) {
				return;
			}
			// Read scrollHeight without our inline `height` interfering.
			const prevHeight = sidebar.style.height;
			sidebar.style.height = '';
			cachedSidebarHeight = sidebar.scrollHeight;
			cachedMasterbarHeight = masterbar.getBoundingClientRect().height;
			sidebar.style.height = prevHeight;
		};

		const apply = () => {
			scheduled = false;
			const { sidebar, content } = getEls();
			if ( ! sidebar || ! content ) {
				return;
			}

			const sH = cachedSidebarHeight;
			const mH = cachedMasterbarHeight;
			const wH = window.innerHeight;

			if ( sH + mH <= wH ) {
				// Sidebar fits in the viewport — let the CSS defaults apply.
				sidebar.removeAttribute( 'style' );
				content.style.minHeight = '';
				return;
			}

			// Ensure the page can scroll far enough to reveal the entire sidebar.
			const minBodyHeight = sH + mH;
			if ( content.scrollHeight < minBodyHeight ) {
				content.style.minHeight = `${ minBodyHeight }px`;
			}

			const scrollY = -document.body.getBoundingClientRect().top;
			const top = Math.max( wH - sH, mH - scrollY );
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
		// - the masterbar: its height changes at the responsive breakpoint.
		// - documentElement: stands in for window resize.
		const resizeObserver = new ResizeObserver( () => {
			measure();
			schedule();
		} );
		resizeObserver.observe( document.documentElement );

		// Initial measurement may need to wait for masterbar to mount.
		const initId = window.requestAnimationFrame( () => {
			measure();
			schedule();
			const { masterbar } = getEls();
			const navigator = document.querySelector< HTMLElement >(
				'.dashboard-responsive-sidebar__sidebar .dashboard-sidebar-navigator'
			);
			if ( navigator ) {
				resizeObserver.observe( navigator );
			}
			if ( masterbar ) {
				resizeObserver.observe( masterbar );
			}
		} );

		window.addEventListener( 'scroll', schedule, { passive: true } );

		return () => {
			window.cancelAnimationFrame( initId );
			window.removeEventListener( 'scroll', schedule );
			resizeObserver.disconnect();
			const { sidebar, content } = getEls();
			sidebar?.removeAttribute( 'style' );
			if ( content ) {
				content.style.minHeight = '';
			}
		};
	}, [ enabled ] );
}
