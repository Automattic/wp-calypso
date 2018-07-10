/**
 * External dependencies
 */
import { forEach } from 'lodash';

const LIVE_REGION_ARIA_ROLES = new Set( [
	'alert',
	'status',
	'log',
	'marquee',
	'timer',
] );

let hiddenElements = [],
	isHidden = false;

/**
 * Hides all elements in the body element from screen-readers except
 * the provided element and elements that should not be hidden from
 * screen-readers.
 *
 * The reason we do this is because `aria-modal="true"` currently is bugged
 * in Safari, and support is spotty in other browsers overall. In the future
 * we should consider removing these helper functions in favor of
 * `aria-modal="true"`.
 *
 * @param {Element} unhiddenElement The element that should not be hidden.
 */
export function hideApp( unhiddenElement ) {
	if ( isHidden ) {
		return;
	}
	const elements = document.body.children;
	forEach( elements, ( element ) => {
		if (
			element === unhiddenElement
		) {
			return;
		}
		if ( elementShouldBeHidden( element ) ) {
			element.setAttribute( 'aria-hidden', 'true' );
			hiddenElements.push( element );
		}
	} );
	isHidden = true;
}

/**
 * Determines if the passed element should not be hidden from screen readers.
 *
 * @param {HTMLElement} element The element that should be checked.
 *
 * @return {boolean} Whether the element should not be hidden from screen-readers.
 */
export function elementShouldBeHidden( element ) {
	const role = element.getAttribute( 'role' );
	return ! (
		element.tagName === 'SCRIPT' ||
		element.hasAttribute( 'aria-hidden' ) ||
		element.hasAttribute( 'aria-live' ) ||
		LIVE_REGION_ARIA_ROLES.has( role )
	);
}

/**
 * Makes all elements in the body that have been hidden by `hideApp`
 * visible again to screen-readers.
 */
export function showApp() {
	if ( ! isHidden ) {
		return;
	}
	forEach( hiddenElements, ( element ) => {
		element.removeAttribute( 'aria-hidden' );
	} );
	hiddenElements = [];
	isHidden = false;
}
