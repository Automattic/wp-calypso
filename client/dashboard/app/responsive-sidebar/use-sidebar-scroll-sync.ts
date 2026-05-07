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

		const onScroll = schedule;
		const onResize = () => {
			measure();
			schedule();
		};

		// Initial measurement may need to wait for masterbar to mount.
		const initId = window.requestAnimationFrame( () => {
			measure();
			schedule();
		} );

		window.addEventListener( 'scroll', onScroll, { passive: true } );
		window.addEventListener( 'resize', onResize );

		return () => {
			window.cancelAnimationFrame( initId );
			window.removeEventListener( 'scroll', onScroll );
			window.removeEventListener( 'resize', onResize );
			const { sidebar, content } = getEls();
			sidebar?.removeAttribute( 'style' );
			if ( content ) {
				content.style.minHeight = '';
			}
		};
	}, [ enabled ] );
}
