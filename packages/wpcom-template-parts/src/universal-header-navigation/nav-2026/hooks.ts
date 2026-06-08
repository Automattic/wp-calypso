import { useState, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

// Detect the platform for the app banner's store glyph (iOS takes precedence over Android).
export function useMobilePlatform( nav2026: boolean ): 'ios' | 'android' | null {
	const [ mobilePlatform, setMobilePlatform ] = useState< 'ios' | 'android' | null >( null );

	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}
		const ua = navigator.userAgent || '';
		if ( /iPad|iPhone|iPod/i.test( ua ) ) {
			setMobilePlatform( 'ios' );
		} else if ( /Android/i.test( ua ) ) {
			setMobilePlatform( 'android' );
		}
	}, [ nav2026 ] );

	return mobilePlatform;
}

// Toggle `is-scrolled` once the page leaves the top (transparent nav → white).
export function useScrollState( nav2026: boolean ): boolean {
	const [ isScrolled, setIsScrolled ] = useState( false );

	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}
		let frame = 0;
		const evaluate = () => {
			frame = 0;
			setIsScrolled( ( prev ) => {
				const next = window.scrollY > 0;
				return next === prev ? prev : next;
			} );
		};
		const onScroll = () => {
			if ( ! frame ) {
				frame = window.requestAnimationFrame( evaluate );
			}
		};
		evaluate();
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		return () => {
			window.removeEventListener( 'scroll', onScroll );
			if ( frame ) {
				window.cancelAnimationFrame( frame );
			}
		};
	}, [ nav2026 ] );

	return isScrolled;
}

// Publish the first nav item's inline-start offset so the dropdown's first column aligns under it.
export function useDropdownOffset( nav2026: boolean, nav2026Variant: 1 | 2 ): void {
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}

		const updateOffset = () => {
			const nav = document.querySelector< HTMLElement >( '.x-nav--2026-redesign' );
			const firstItem = nav?.querySelector< HTMLElement >( '.x-nav-item__wide .x-nav-link' );
			// The dropdown panel is a SIBLING of the nav, so the var must live on a common
			// ancestor (`.lpc-header-nav-container`) to reach it.
			const host = nav?.closest< HTMLElement >( '.lpc-header-nav-container' );
			if ( ! nav || ! firstItem || ! host ) {
				return;
			}
			const isRTL = getComputedStyle( nav ).direction === 'rtl';
			const hostRect = host.getBoundingClientRect();
			const itemRect = firstItem.getBoundingClientRect();
			const inlineStart = isRTL ? hostRect.right - itemRect.right : itemRect.left - hostRect.left;
			host.style.setProperty(
				'--dropdown-trigger-inline-start',
				`${ Math.round( inlineStart ) }px`
			);
		};

		let frame = 0;
		const onResize = () => {
			if ( ! frame ) {
				frame = window.requestAnimationFrame( () => {
					frame = 0;
					updateOffset();
				} );
			}
		};
		updateOffset();
		window.addEventListener( 'resize', onResize, { passive: true } );
		return () => {
			window.removeEventListener( 'resize', onResize );
			if ( frame ) {
				window.cancelAnimationFrame( frame );
			}
		};
	}, [ nav2026, nav2026Variant ] );
}

interface UseFooterHeightArgs {
	nav2026: boolean;
	isMobileMenuOpen: boolean;
	isLoggedIn: boolean;
	mobilePlatform: 'ios' | 'android' | null;
	footerRef: React.RefObject< HTMLDivElement >;
}

// Publish the overlaid footer's height as a CSS var so the scroller clears it.
export function useFooterHeight( {
	nav2026,
	isMobileMenuOpen,
	isLoggedIn,
	mobilePlatform,
	footerRef,
}: UseFooterHeightArgs ): void {
	useEffect( () => {
		// Only while the menu is open — no point measuring the off-screen footer otherwise.
		if ( ! nav2026 || ! isMobileMenuOpen || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		const footer = footerRef.current;
		if ( ! footer ) {
			return;
		}
		// Set it on a common ancestor so the scroller inherits it.
		const host = footer.closest< HTMLElement >( '.x-menu-content' ) ?? footer;
		const sync = () => {
			if ( footer.offsetHeight ) {
				host.style.setProperty( '--x-menu-2026-footer-height', `${ footer.offsetHeight }px` );
			}
		};
		const observer = new ResizeObserver( sync );
		observer.observe( footer );
		sync();
		return () => observer.disconnect();
	}, [ nav2026, isMobileMenuOpen, isLoggedIn, mobilePlatform, footerRef ] );
}

interface UseDropdownFlipArgs {
	nav2026: boolean;
	activeDropdown: string | null;
}

// Desktop dropdown: the panel stays open between triggers and FLIP-eases its height on a
// switch. `useLayoutEffect` so the measure/pin happens before paint (no auto-height flash).
// Owns and returns the panel ref to attach to the dropdown element.
export function useDropdownFlip( {
	nav2026,
	activeDropdown,
}: UseDropdownFlipArgs ): React.RefObject< HTMLDivElement > {
	const dropdownRef = useRef< HTMLDivElement >( null );
	// FLIP bookkeeping: `prevDropdown` distinguishes first-open from switch; `prevHeight` is the `from`.
	const prevDropdownRef = useRef< string | null >( null );
	const prevHeightRef = useRef< number >( 0 );

	useIsomorphicLayoutEffect( () => {
		if ( ! nav2026 || typeof window === 'undefined' ) {
			return;
		}
		const el = dropdownRef.current;
		const prev = prevDropdownRef.current;
		const next = activeDropdown;
		prevDropdownRef.current = next;
		if ( ! el ) {
			return;
		}
		// The height morph is desktop-only (below 1025 the wide triggers / dropdown are hidden).
		if ( window.matchMedia( '( max-width: 1024px )' ).matches ) {
			return;
		}

		// Height-morph duration in ms. Read the panel-duration CSS var directly rather than
		// `transitionDuration` — that property is a comma list (visibility, height) and
		// `parseFloat` would pick the first (visibility) value, not the height one.
		const morphMs = () => {
			const raw = getComputedStyle( el ).getPropertyValue( '--x-dropdown-2026-panel-duration' );
			return parseFloat( raw ) * 1000 || 280;
		};

		// Closed → open: let the panel grow via CSS; flag the unroll so items wait for it. Drop
		// the flag after the morph so a later switch uses the short stagger.
		if ( prev === null && next !== null ) {
			el.classList.add( 'is-dropdown-first-open' );
			const timer = setTimeout(
				() => el.classList.remove( 'is-dropdown-first-open' ),
				morphMs() + 50
			);
			return () => {
				clearTimeout( timer );
				// Stash the current height so the next switch FLIPs from the right `from`.
				prevHeightRef.current = el.offsetHeight;
			};
		}

		// Open → closed: nothing to morph; clear the first-open marker.
		if ( prev !== null && next === null ) {
			el.classList.remove( 'is-dropdown-first-open' );
			return;
		}

		// Open → open (switch): FLIP the wrapper height between the two menus' content.
		if ( prev !== null && next !== null && prev !== next ) {
			el.classList.remove( 'is-dropdown-first-open' );
			// Honor reduced-motion: snap to the new height instead of animating it.
			if ( window.matchMedia( '( prefers-reduced-motion: reduce )' ).matches ) {
				return () => {
					prevHeightRef.current = el.offsetHeight;
				};
			}
			const from = prevHeightRef.current;
			const to = el.offsetHeight;
			if ( ! from || from === to ) {
				return () => {
					prevHeightRef.current = el.offsetHeight;
				};
			}
			// Non-null alias so the listener/cleanup closures keep `el`'s narrowing.
			const node = el;
			node.style.overflow = 'hidden';
			node.style.height = `${ from }px`;
			void node.offsetHeight; // force reflow so the next height change transitions
			node.style.height = `${ to }px`;
			// `release` snaps back to auto height; idempotent (the `released` guard), so whichever
			// of the transitionend listener or the fallback timer fires first wins.
			let released = false;
			// AbortController detaches the listener — avoids `{ once: true }`, whose stale handler
			// could fire on the *next* morph's transitionend and release it prematurely.
			const listenerAbort = new AbortController();
			const release = () => {
				if ( released ) {
					return;
				}
				released = true;
				listenerAbort.abort();
				node.style.height = '';
				node.style.overflow = '';
			};
			node.addEventListener(
				'transitionend',
				( e: TransitionEvent ) => {
					if ( e.target === node && e.propertyName === 'height' ) {
						release();
					}
				},
				{ signal: listenerAbort.signal }
			);
			const fallback = window.setTimeout( release, morphMs() + 50 );
			return () => {
				// Released early if the dropdown changes mid-morph; `to` is the FLIP target (the
				// settled height) for the next switch, no extra layout read needed.
				clearTimeout( fallback );
				release();
				prevHeightRef.current = to;
			};
		}

		return () => {
			prevHeightRef.current = el.offsetHeight;
		};
	}, [ nav2026, activeDropdown ] );

	return dropdownRef;
}
