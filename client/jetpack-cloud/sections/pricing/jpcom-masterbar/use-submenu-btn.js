import { useEffect } from 'react';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';

/*
 * WARNING: script below is directly ported from
 * https://opengrok.a8c.com/source/xref/a8c/jetpackme-new/js/header.js
 */
export default function useSubmenuBtn() {
	useEffect( () => {
		function toggleMenuItem( btn, menu ) {
			const expanded = btn.getAttribute( 'aria-expanded' ) === 'true' || false;
			btn.setAttribute( 'aria-expanded', ! expanded );

			menu.hidden = ! menu.hidden;
		}

		function collapseExpandedMenu() {
			const expandedBtn = document.querySelector( '.js-menu-btn[aria-expanded="true"]' );

			if ( expandedBtn ) {
				const menu = expandedBtn.parentNode.querySelector( '.js-menu' );

				if ( menu ) {
					toggleMenuItem( expandedBtn, menu );
				}
			}
		}

		function initMenu( btn ) {
			const menu = btn.parentNode.querySelector( '.js-menu' );

			if ( ! menu ) {
				return;
			}

			menu.classList.add( 'js' );
			menu.hidden = true;

			const toggle = function () {
				toggleMenuItem( btn, menu );
			};

			btn.addEventListener( 'click', function ( e ) {
				e.preventDefault();

				if ( btn.getAttribute( 'aria-expanded' ) === 'false' ) {
					collapseExpandedMenu();
				}

				toggle();
			} );

			menu.addEventListener( 'click', function ( e ) {
				// If user clicks menu backdrop
				if ( e.target === menu ) {
					toggle();
				}
			} );

			const backBtn = menu.querySelector( '.js-menu-back' );

			if ( backBtn ) {
				backBtn.addEventListener( 'click', function () {
					toggle();
				} );
			}

			// Collapse menu when focusing out
			const lastFocusable = getLastFocusableElement( menu );

			if ( lastFocusable ) {
				lastFocusable.addEventListener( 'focusout', toggle );
			}
		}

		// Close expanded menu on Esc keypress
		function onKeyDown( e ) {
			if ( e.key === 'Escape' ) {
				collapseExpandedMenu();
			}
		}

		const menuBtns = document.querySelectorAll( '.js-menu-btn' );

		Array.prototype.forEach.call( menuBtns, initMenu );

		document.addEventListener( 'keydown', onKeyDown );

		return () => {
			document.removeEventListener( 'keydown', onKeyDown );
		};
	}, [] );
}
