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
	const prevDropdownRef = useRef< string | null >( null );
	// React has already rendered the next panel, so cache previous panel heights.
	const heightByNameRef = useRef< Record< string, number > >( {} );
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

		const cssMs = ( property: string, fallback: number ) => {
			const raw = getComputedStyle( el ).getPropertyValue( property ).trim();
			const value = parseFloat( raw );
			if ( ! value ) {
				return fallback;
			}
			return /ms$/.test( raw ) ? value : value * 1000;
		};
		const morphMs = () => cssMs( '--x-dropdown-2026-panel-duration', 280 );
		const closeMs = () => cssMs( '--x-dropdown-2026-close-duration', morphMs() );

		// Clear any in-flight inline height before measuring.
		releaseRef.current?.();

		const animateHeight = ( from: number, to: number, duration: number ) => {
			if ( from === to || window.matchMedia( '( prefers-reduced-motion: reduce )' ).matches ) {
				return;
			}

			const node = el;
			node.style.overflow = 'hidden';
			node.style.height = `${ from }px`;
			void node.offsetHeight;
			node.style.height = `${ to }px`;

			let released = false;
			const fallback = window.setTimeout( release, duration + 50 );
			function release() {
				if ( released ) {
					return;
				}
				released = true;
				node.removeEventListener( 'transitionend', onEnd );
				window.clearTimeout( fallback );
				node.style.height = '';
				node.style.overflow = '';
				releaseRef.current = null;
			}
			function onEnd( e: TransitionEvent ) {
				if ( e.target === node && e.propertyName === 'height' ) {
					release();
				}
			}

			node.addEventListener( 'transitionend', onEnd );
			releaseRef.current = release;
			return release;
		};

		// Closed -> open.
		if ( prev === null && next !== null ) {
			el.classList.add( 'is-dropdown-first-open' );
			const timer = setTimeout(
				() => el.classList.remove( 'is-dropdown-first-open' ),
				morphMs() + 50
			);
			const to = el.offsetHeight;
			heightByNameRef.current[ next ] = to;

			const release = to ? animateHeight( 0, to, morphMs() ) : undefined;
			return () => {
				clearTimeout( timer );
				release?.();
			};
		}

		// Open -> closed.
		if ( prev !== null && next === null ) {
			el.classList.remove( 'is-dropdown-first-open' );
			const held = heightByNameRef.current[ prev ];
			if ( ! held ) {
				return;
			}
			// CSS close selectors rely on this serializing to `height: 0px`.
			return animateHeight( held, 0, closeMs() );
		}

		// Open -> open.
		if ( prev !== null && next !== null && prev !== next ) {
			el.classList.remove( 'is-dropdown-first-open' );
			const to = el.offsetHeight;
			const from = heightByNameRef.current[ prev ] ?? to;
			heightByNameRef.current[ next ] = to;

			if ( ! from ) {
				return;
			}

			return animateHeight( from, to, morphMs() );
		}
	}, [ nav2026, activeDropdown ] );

	return dropdownRef;
}
