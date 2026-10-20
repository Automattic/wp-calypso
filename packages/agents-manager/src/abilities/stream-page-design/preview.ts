/**
 * What the canvas shows while a design streams: an outline on the block still
 * being written, and the canvas following it down.
 */

import { getCanvasDocument } from '../../utils/editor-canvas';

export const PREVIEW_CLASS_NAME = 'is-agents-manager-page-design-preview';

const PREVIEW_STYLES_ID = 'agents-manager-page-design-preview-styles';

/** The attributes with the preview class added to `className`. */
export const addPreviewClass = (
	attributes: Record< string, unknown >
): Record< string, unknown > => ( {
	...attributes,
	className: [
		typeof attributes.className === 'string' ? attributes.className : '',
		PREVIEW_CLASS_NAME,
	]
		.filter( Boolean )
		.join( ' ' ),
} );

// The pulse stops under `prefers-reduced-motion`; the outline alone still marks the block.
const PREVIEW_STYLES_CSS = `
	.${ PREVIEW_CLASS_NAME } {
		position: relative;
		overflow: hidden;
		outline: 2px solid rgba(56, 88, 233, 0.38);
		outline-offset: 6px;
		box-shadow: 0 0 0 6px rgba(56, 88, 233, 0.08);
	}

	.${ PREVIEW_CLASS_NAME }::after {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		background: linear-gradient(
			120deg,
			rgba(255, 255, 255, 0.03) 0%,
			rgba(255, 255, 255, 0.24) 45%,
			rgba(86, 132, 255, 0.18) 55%,
			rgba(255, 255, 255, 0.03) 100%
		);
		opacity: 0.7;
		animation: agents-manager-page-design-preview-pulse 1.6s ease-in-out infinite;
	}

	@keyframes agents-manager-page-design-preview-pulse {
		0% {
			opacity: 0.18;
		}

		50% {
			opacity: 0.5;
		}

		100% {
			opacity: 0.18;
		}
	}

	@media ( prefers-reduced-motion: reduce ) {
		.${ PREVIEW_CLASS_NAME }::after {
			animation: none;
			opacity: 0.24;
		}
	}
`;

function injectPreviewStyles( targetDocument: Document | null ): void {
	if ( ! targetDocument || targetDocument.getElementById( PREVIEW_STYLES_ID ) ) {
		return;
	}

	const style = targetDocument.createElement( 'style' );

	style.id = PREVIEW_STYLES_ID;
	style.textContent = PREVIEW_STYLES_CSS;
	// A document still loading may have no head yet.
	( targetDocument.head ?? targetDocument.documentElement )?.appendChild( style );
}

/** Injects the preview styles into the page and the editor canvas, once each. */
export function ensurePreviewStyles(): void {
	injectPreviewStyles( document );
	injectPreviewStyles( getCanvasDocument() );
}

const getScrollBehavior = (): ScrollBehavior =>
	window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches ? 'auto' : 'smooth';

function getScrollParent( node: HTMLElement ): HTMLElement | null {
	for ( let parent = node.parentElement; parent; parent = parent.parentElement ) {
		const overflowY = parent.ownerDocument.defaultView?.getComputedStyle( parent ).overflowY ?? '';

		if ( parent.scrollHeight > parent.clientHeight && /(auto|scroll)/.test( overflowY ) ) {
			return parent;
		}
	}

	return null;
}

function scrollBlockBottomIntoView( node: HTMLElement ): void {
	const ownerDocument = node.ownerDocument;
	const ownerWindow = ownerDocument.defaultView;
	const scrollParent = getScrollParent( node );
	const nodeBottom = node.getBoundingClientRect().bottom;

	if ( scrollParent ) {
		const parentBottom = scrollParent.getBoundingClientRect().bottom;

		scrollParent.scrollTo( {
			top: Math.max( 0, scrollParent.scrollTop + nodeBottom - parentBottom + 24 ),
			behavior: getScrollBehavior(),
		} );
		return;
	}

	const scrollingElement = ownerDocument.scrollingElement ?? ownerDocument.documentElement;
	const viewportHeight = ownerWindow?.innerHeight ?? scrollingElement.clientHeight;

	ownerWindow?.scrollTo( {
		top: Math.max( 0, scrollingElement.scrollTop + nodeBottom - viewportHeight + 24 ),
		behavior: getScrollBehavior(),
	} );
}

// One follow at a time: a newer target replaces the frames still queued for the last.
let followFrame: number | null = null;

/**
 * Brings the bottom of the block being streamed into view, by measured
 * coordinates rather than `scrollIntoView`, which can fire before the block is
 * tall enough to extend the scroll area. Keeps following the block for a few
 * frames while the editor renders its streamed children.
 */
export function scrollToBlockBottom( clientId: string ): void {
	const follow = ( framesLeft: number ): void => {
		followFrame = null;

		// An editor without an iframed canvas renders the blocks in the page itself.
		const node = ( getCanvasDocument() ?? document ).querySelector< HTMLElement >(
			`[data-block="${ clientId }"]`
		);

		if ( node ) {
			try {
				scrollBlockBottomIntoView( node );
			} catch {
				// Best effort: a frame that cannot be measured is left where it is.
			}
		}

		if ( framesLeft > 0 ) {
			followFrame = requestAnimationFrame( () => follow( framesLeft - 1 ) );
		}
	};

	if ( followFrame !== null ) {
		cancelAnimationFrame( followFrame );
	}

	followFrame = requestAnimationFrame( () => follow( 8 ) );
}
