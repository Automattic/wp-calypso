import { useState, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

// Platform for the app banner's store glyph (iOS wins over Android).
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

// True once the page leaves the top (drives the transparent → white nav).
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

// Align the dropdown's first column under the first nav item.
export function useDropdownOffset( nav2026: boolean, nav2026Variant: 1 | 2 ): void {
	useEffect( () => {
		if ( ! nav2026 ) {
			return;
		}

		const updateOffset = () => {
			const nav = document.querySelector< HTMLElement >( '.x-nav--2026-redesign' );
			const firstItem = nav?.querySelector< HTMLElement >( '.x-nav-item__wide .x-nav-link' );
			// Var lives on the shared ancestor — the panel is a sibling of the nav.
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

// Publish the overlaid footer's height so the scroller can clear it.
export function useFooterHeight( {
	nav2026,
	isMobileMenuOpen,
	isLoggedIn,
	mobilePlatform,
	footerRef,
}: UseFooterHeightArgs ): void {
	useEffect( () => {
		// Only while the menu is open — the footer is off-screen otherwise.
		if ( ! nav2026 || ! isMobileMenuOpen || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		const footer = footerRef.current;
		if ( ! footer ) {
			return;
		}
		// On a shared ancestor so the scroller inherits it.
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

// FLIP-eases the desktop dropdown's height when switching menus. Owns + returns the panel ref.
export function useDropdownFlip( {
	nav2026,
	activeDropdown,
}: UseDropdownFlipArgs ): React.RefObject< HTMLDivElement > {
	const dropdownRef = useRef< HTMLDivElement >( null );
	// Tells first-open from switch.
	const prevDropdownRef = useRef< string | null >( null );
	// Each panel's resting height, keyed by name. By the time this effect runs the
	// DOM already shows the incoming panel, so the outgoing height (the FLIP `from`)
	// has to come from here, not a live measurement.
	const heightByNameRef = useRef< Record< string, number > >( {} );
	// Release callback for an in-flight morph, so a rapid re-switch can snap back first.
	const releaseRef = useRef< ( () => void ) | null >( null );

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
		// Desktop-only; below 1025 the wide triggers / dropdown are hidden.
		if ( window.matchMedia( '( max-width: 1024px )' ).matches ) {
			return;
		}

		// Read the CSS var, not `transitionDuration` — that's a comma list (visibility, height)
		// and `parseFloat` would grab visibility, not the height value we want.
		const morphMs = () => {
			const raw = getComputedStyle( el ).getPropertyValue( '--x-dropdown-2026-panel-duration' );
			return parseFloat( raw ) * 1000 || 280;
		};

		// Snap any in-flight morph back to `auto` before we measure, so reads are clean.
		releaseRef.current?.();

		// Closed → open: let CSS grow the panel; flag the unroll so items wait for it.
		if ( prev === null && next !== null ) {
			el.classList.add( 'is-dropdown-first-open' );
			const timer = setTimeout(
				() => el.classList.remove( 'is-dropdown-first-open' ),
				morphMs() + 50
			);
			// Record the opened panel's resting height for a future switch's `from`.
			heightByNameRef.current[ next ] = el.offsetHeight;
			return () => clearTimeout( timer );
		}

		// Open → closed: nothing to morph. Don't re-measure here — the panel content
		// is already `aria-hidden` / out of flow, so `el.offsetHeight` reads 0; the
		// cached resting height (stored on open / switch) is the one to keep.
		if ( prev !== null && next === null ) {
			el.classList.remove( 'is-dropdown-first-open' );
			return;
		}

		// Open → open: FLIP the wrapper height between the two menus.
		if ( prev !== null && next !== null && prev !== next ) {
			el.classList.remove( 'is-dropdown-first-open' );
			// `to` is live (DOM already shows `next`); `from` is the outgoing panel's
			// stored height, falling back to a live read only if we never saw it.
			const to = el.offsetHeight;
			const from = heightByNameRef.current[ prev ] ?? to;
			// Keep the incoming panel's height fresh for the next switch.
			heightByNameRef.current[ next ] = to;

			// Reduced motion, equal heights, or no usable `from`: snap, don't animate.
			if (
				! from ||
				from === to ||
				window.matchMedia( '( prefers-reduced-motion: reduce )' ).matches
			) {
				return;
			}

			// Alias keeps `el`'s non-null narrowing inside the closures.
			const node = el;
			node.style.overflow = 'hidden';
			node.style.height = `${ from }px`;
			void node.offsetHeight; // force reflow so the height change transitions
			node.style.height = `${ to }px`;
			// `release` snaps back to auto height; idempotent, so listener or fallback can win.
			let released = false;
			// AbortController over `{ once: true }` — a stale once-handler could fire on the
			// next morph's transitionend and release it early.
			const listenerAbort = new AbortController();
			const release = () => {
				if ( released ) {
					return;
				}
				released = true;
				listenerAbort.abort();
				node.style.height = '';
				node.style.overflow = '';
				releaseRef.current = null;
			};
			releaseRef.current = release;
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
				clearTimeout( fallback );
				release();
			};
		}
	}, [ nav2026, activeDropdown ] );

	return dropdownRef;
}
