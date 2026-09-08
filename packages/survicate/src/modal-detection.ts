import debug from './debug';

/**
 * Selects open modal dialogs and popovers: a11y-correct modals (requiring
 * `aria-modal` excludes generic `role="dialog"` widgets), native
 * `<dialog open>`, older `@wordpress/components` Modal versions whose
 * `aria-modal` attribute sat on an inner node, and `@wordpress/components`
 * Popover — excluding Tooltip, which reuses the popover class and would
 * otherwise suppress surveys on every hover.
 */
export const MODAL_SELECTOR =
	'[role="dialog"][aria-modal="true"], dialog[open], .components-modal__screen-overlay, .components-popover:not(.components-tooltip)';

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

/**
 * Whether a Survicate survey is currently rendered on screen. Used to attribute
 * the "modal opened over a survey" suppression: the modal observer fires on every
 * modal insertion, but only counts as a suppression when a survey was actually
 * visible to be closed. Fails open to `false` (no survey → nothing suppressed).
 */
export function isSurveyVisible(): boolean {
	if ( typeof document === 'undefined' ) {
		return false;
	}

	try {
		const survey = document.querySelector(
			'#survicate-box [role="dialog"], [class*="survicate-box"] [role="dialog"]'
		);
		return !! survey && isElementRendered( survey );
	} catch {
		return false;
	}
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
 * Watches for modal dialogs being inserted into or removed from the document.
 * Invokes `onOpen` for each mutation batch that inserts a modal, and
 * `onAllClosed` when a batch removes a modal and no modal remains open. Only
 * added/removed nodes are inspected, so the observer is cheap on ordinary DOM
 * churn. Attribute changes are not observed (a native `<dialog>` toggled via
 * `open` in place is the one miss; the `survey_displayed` check still covers
 * it on the next display).
 * @returns A cleanup function that disconnects the observer.
 */
export function observeModals( onOpen: () => void, onAllClosed?: () => void ): () => void {
	if ( typeof document === 'undefined' || typeof MutationObserver === 'undefined' ) {
		return () => {};
	}

	const observer = new MutationObserver( ( mutations ) => {
		let sawRemovedModal = false;

		for ( const mutation of mutations ) {
			for ( const node of mutation.addedNodes ) {
				if ( nodeContainsModal( node ) ) {
					debug( 'Modal inserted while observing' );
					onOpen();
					return;
				}
			}
			if ( onAllClosed && ! sawRemovedModal ) {
				for ( const node of mutation.removedNodes ) {
					if ( nodeContainsModal( node ) ) {
						sawRemovedModal = true;
						break;
					}
				}
			}
		}

		if ( sawRemovedModal && onAllClosed && ! isModalOpen() ) {
			debug( 'Last modal removed while observing' );
			onAllClosed();
		}
	} );

	observer.observe( document.body, { childList: true, subtree: true } );

	return () => observer.disconnect();
}
