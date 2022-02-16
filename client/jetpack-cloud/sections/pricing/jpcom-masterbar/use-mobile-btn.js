import { useEffect } from 'react';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';

/*
 * WARNING: script below is directly ported from
 * https://opengrok.a8c.com/source/xref/a8c/jetpackme-new/js/header.js
 */
export default function useMobileBtn() {
	useEffect( () => {
		const MOBILE_BP = 900; // lrg-screen breakpoint
		const menu = document.querySelector( '.js-mobile-menu' );
		const btn = document.querySelector( '.js-mobile-btn' );
		const body = document.querySelector( 'body' );

		if ( ! menu || ! btn ) {
			return;
		}

		function toggle() {
			const expanded = btn.getAttribute( 'aria-expanded' ) === 'true' || false;

			btn.setAttribute( 'aria-expanded', ! expanded );

			if ( ! expanded ) {
				menu.classList.add( 'is-expanded' );
				body.classList.add( 'no-scroll' );
			} else {
				menu.classList.remove( 'is-expanded' );
				body.classList.remove( 'no-scroll' );
			}
		}

		// Close expanded menu on Esc keypress
		function onKeyDown( e ) {
			if ( e.key === 'Escape' && btn.getAttribute( 'aria-expanded' ) === 'true' ) {
				toggle();
			}
		}

		function onResize() {
			if ( window.innerWidth > MOBILE_BP ) {
				body.classList.remove( 'no-scroll' );
			}
		}

		btn.addEventListener( 'click', function ( e ) {
			e.preventDefault();

			toggle();
		} );

		// Collapse menu when focusing out
		const lastFocusable = getLastFocusableElement( menu );

		if ( lastFocusable ) {
			lastFocusable.addEventListener( 'focusout', function () {
				if ( btn.getAttribute( 'aria-expanded' ) === 'true' ) {
					toggle();
				}
			} );
		}

		window.addEventListener( 'resize', onResize );
		document.addEventListener( 'keydown', onKeyDown );

		return () => {
			window.removeEventListener( 'resize', onResize );
			document.removeEventListener( 'keydown', onKeyDown );
		};
	}, [] );
}
