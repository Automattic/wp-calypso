import { useEffect } from 'react';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';

/*
 * WARNING: script below is directly ported from
 * https://opengrok.a8c.com/source/xref/a8c/jetpackme-new/js/header.js
 */
export default function useUserMenu() {
	useEffect( () => {
		const menu = document.querySelector( '.js-user-menu' );
		const btn = document.querySelector( '.js-user-menu-btn' );

		if ( ! menu || ! btn ) {
			return;
		}

		menu.classList.add( 'js' );
		menu.hidden = true;

		function onDocumentClick( e ) {
			if ( ! menu.contains( e.target ) ) {
				btn.setAttribute( 'aria-expanded', false );
				menu.hidden = true;
			}
		}

		function toggle() {
			const expanded = btn.getAttribute( 'aria-expanded' ) === 'true' || false;

			if ( expanded ) {
				document.removeEventListener( 'click', onDocumentClick );
			} else {
				document.addEventListener( 'click', onDocumentClick );
			}

			btn.setAttribute( 'aria-expanded', ! expanded );
			menu.hidden = ! menu.hidden;
		}

		function onBtnClick( e ) {
			e.preventDefault();
			e.stopPropagation();

			toggle();
		}

		btn.addEventListener( 'click', onBtnClick );

		// Collapse menu when focusing out
		const lastFocusable = getLastFocusableElement( menu );

		if ( lastFocusable ) {
			lastFocusable.addEventListener( 'focusout', toggle );
		}

		return () => {
			document.removeEventListener( 'click', onDocumentClick );
		};
	}, [] );
}
