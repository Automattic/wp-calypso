import { isRTL } from '@wordpress/i18n';
import { useEffect, useRef, type RefObject } from 'react';

// Controls that already give the arrow keys a meaning of their own.
const OWNS_ARROWS = [
	'input',
	'textarea',
	'select',
	'[contenteditable]:not([contenteditable="false"])',
	'[role="radiogroup"]',
	'[role="radio"]',
	'[role="tablist"]',
	'[role="slider"]',
	'[role="spinbutton"]',
	'[role="textbox"]',
	'[role="combobox"]',
	'[role="listbox"]',
	'[role="menu"]',
	'[role="menubar"]',
	'[role="grid"]',
	'[role="tree"]',
	'[role="dialog"]',
].join( ',' );

/**
 * Left and right step through the designs while nothing else on the page wants those keys: from
 * the page itself or from anywhere in the gallery.
 */
export function useArrowBrowsing(
	gallery: RefObject< HTMLElement | null >,
	onStep: ( step: 1 | -1 ) => void
) {
	const step = useRef( onStep );
	step.current = onStep;

	useEffect( () => {
		const onKeyDown = ( event: KeyboardEvent ) => {
			if (
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				event.shiftKey ||
				( event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' )
			) {
				return;
			}
			const target = event.target instanceof Element ? event.target : null;
			const fromPage = ! target || target === document.body || target === document.documentElement;
			if ( ! fromPage && ! gallery.current?.contains( target ) ) {
				return;
			}
			if ( target?.closest( OWNS_ARROWS ) ) {
				return;
			}
			event.preventDefault();
			const forward = isRTL() ? 'ArrowLeft' : 'ArrowRight';
			step.current( event.key === forward ? 1 : -1 );
		};
		document.addEventListener( 'keydown', onKeyDown );
		return () => document.removeEventListener( 'keydown', onKeyDown );
	}, [ gallery ] );
}
