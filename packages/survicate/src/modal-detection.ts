import debug from './debug';

/**
 * Selects open modal dialogs: a11y-correct modals (requiring `aria-modal`
 * excludes popovers/tooltips that only set `role="dialog"`), native
 * `<dialog open>`, and older `@wordpress/components` Modal versions whose
 * `aria-modal` attribute sat on an inner node.
 */
export const MODAL_SELECTOR =
	'[role="dialog"][aria-modal="true"], dialog[open], .components-modal__screen-overlay';

/**
 * The Survicate widget renders `role="dialog"`/`aria-modal` elements inside
 * `<div id="survicate-box" class="survicate-box-<type>">`; without this
 * exclusion every survey would suppress itself on display.
 */
const SURVICATE_CONTAINER_SELECTOR = '#survicate-box, [class*="survicate-box"]';

function isElementRendered( element: Element ): boolean {
	const el = element as Element & { checkVisibility?: () => boolean };
	if ( typeof el.checkVisibility === 'function' ) {
		return el.checkVisibility();
	}
	return element.getClientRects().length > 0;
}

/**
 * Checks whether any modal dialog (other than Survicate's own widget) is
 * currently open and rendered. Fails open: any error means "no modal".
 */
export function isModalOpen(): boolean {
	if ( typeof document === 'undefined' ) {
		return false;
	}

	try {
		const candidates = document.querySelectorAll( MODAL_SELECTOR );
		for ( const candidate of candidates ) {
			if ( candidate.closest( SURVICATE_CONTAINER_SELECTOR ) ) {
				continue;
			}
			if ( ! isElementRendered( candidate ) ) {
				continue;
			}
			debug( 'Modal detected: %o', candidate );
			return true;
		}
	} catch {
		return false;
	}

	return false;
}

function nodeContainsModal( node: Node ): boolean {
	if ( ! ( node instanceof Element ) ) {
		return false;
	}
	if ( node.closest( SURVICATE_CONTAINER_SELECTOR ) ) {
		return false;
	}

	const candidates = node.matches( MODAL_SELECTOR )
		? [ node ]
		: Array.from( node.querySelectorAll( MODAL_SELECTOR ) );

	return candidates.some( ( el ) => ! el.closest( SURVICATE_CONTAINER_SELECTOR ) );
}

/**
 * Watches for modal dialogs being inserted into the document and invokes
 * `onOpen` for each mutation batch that contains one. Only added nodes are
 * inspected, so the observer is cheap on ordinary DOM churn. Attribute
 * changes are not observed (a native `<dialog>` toggled via `open` in place
 * is the one miss; the `survey_displayed` check still covers it on the next
 * display).
 * @returns A cleanup function that disconnects the observer.
 */
export function observeModals( onOpen: () => void ): () => void {
	if ( typeof document === 'undefined' || typeof MutationObserver === 'undefined' ) {
		return () => {};
	}

	const observer = new MutationObserver( ( mutations ) => {
		for ( const mutation of mutations ) {
			for ( const node of mutation.addedNodes ) {
				if ( nodeContainsModal( node ) ) {
					debug( 'Modal inserted while observing' );
					onOpen();
					return;
				}
			}
		}
	} );

	observer.observe( document.body, { childList: true, subtree: true } );

	return () => observer.disconnect();
}
